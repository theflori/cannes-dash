// deploy-marker 1778506899
// POST /api/messaging/waitlist
// Body: { recordIds: string[] }
//   1. Generate Decline Code (no plus-one for waitlist)
//   2. Save + set Messaging Status = Waitlist
//   3. Send waitlist email + SMS

import {
  airtableGet, airtablePatch,
  sendEmail, sendSms, normalizePhone,
  generateUniqueCode,
  markSendError, markSendWarning, clearSendError,
  jsonError, jsonOk
} from '../../_lib/messaging-utils.js';
import { renderWaitlistEmail, renderWaitlistSms } from '../../_lib/templates.js';

import { safe } from '../../_lib/safe-handler.js';
export const onRequestPost = safe("POST /api/messaging/waitlist", async (context) => {
  const { request, env } = context;

  const required = ['AIRTABLE_TOKEN', 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_NAME', 'RESEND_API_KEY'];
  for (const k of required) {
    if (!env[k]) return jsonError(`Missing env: ${k}`, 500);
  }

  let body;
  try { body = await request.json(); }
  catch { return jsonError('Invalid JSON', 400); }

  const recordIds = Array.isArray(body.recordIds) ? body.recordIds.filter(x => typeof x === 'string') : [];
  if (recordIds.length === 0) return jsonError('Missing recordIds', 400);
  if (recordIds.length > 50) return jsonError('Too many records (max 50)', 400);

  // emailOnly=true: just re-send the waitlist email (used for "Send pay option to waitlist")
  // - keeps existing decline code
  // - skips SMS
  // - skips status change (assumes already on Waitlist)
  const emailOnly = body.emailOnly === true;

  const results = { waitlisted: 0, emailSent: 0, smsSent: 0, failed: [], skipped: [] };

  for (const recordId of recordIds) {
    try {
      const record = await airtableGet(env, recordId);
      const f = record.fields || {};

      const email = (f['Email'] || '').trim();
      const phone = normalizePhone(f['Phone'] || '');
      const name = f['Full Name'] || 'Guest';

      if (!email) {
        results.skipped.push({ id: recordId, reason: 'missing-email' });
        continue;
      }

      // In emailOnly mode, skip non-waitlist guests
      if (emailOnly && f['Messaging Status'] !== 'Waitlist') {
        results.skipped.push({ id: recordId, reason: 'not-on-waitlist (' + (f['Messaging Status'] || 'empty') + ')' });
        continue;
      }

      // Reuse existing decline code in emailOnly, otherwise generate
      const declineCode = emailOnly
        ? (f['Decline Code'] || await generateUniqueCode(env, 'Decline Code'))
        : await generateUniqueCode(env, 'Decline Code');

      let emailOk = false;
      try {
        const dashUrl = (env.DASHBOARD_PUBLIC_URL || '').replace(/\/$/, '');
        const payUrl = (env.STRIPE_SECRET_KEY && dashUrl) ? `${dashUrl}/api/stripe/checkout?rid=${encodeURIComponent(recordId)}` : '';
        const c = renderWaitlistEmail({ name, declineCode, payUrl });
        await sendEmail(env, { to: email, subject: c.subject, html: c.html, text: c.text });
        emailOk = true;
        results.emailSent++;
      } catch (err) {
        console.error(`Waitlist email failed for ${recordId}:`, err.message);
        results.failed.push({ id: recordId, channel: 'email', reason: err.message });
      }

      let smsOk = false;
      if (!emailOnly && phone && env.TWILIO_ACCOUNT_SID) {
        try {
          const smsBody = renderWaitlistSms({ name, declineCode });
          await sendSms(env, { to: phone, body: smsBody });
          smsOk = true;
          results.smsSent++;
        } catch (err) {
          console.error(`Waitlist SMS failed for ${recordId}:`, err.message);
          results.failed.push({ id: recordId, channel: 'sms', reason: err.message });
        }
      }

      if (emailOnly) {
        // Only update last-sent timestamp + decline code (if newly generated)
        const patch = { 'Last Message Sent At': new Date().toISOString() };
        if (!f['Decline Code']) patch['Decline Code'] = declineCode;
        await airtablePatch(env, recordId, patch);
      } else {
        await airtablePatch(env, recordId, {
          'Messaging Status': 'Waitlist',
          'Decline Code': declineCode,
          'Last Message Sent At': new Date().toISOString()
        });
      }

      // Track outcome
      if (!emailOk) {
        await markSendError(env, recordId, 'Waitlist email failed: ' + (results.failed.find(x=>x.id===recordId && x.channel==='email')?.reason || 'unknown'));
      } else if (!emailOnly && phone && env.TWILIO_ACCOUNT_SID && !smsOk) {
        await markSendWarning(env, recordId, 'SMS failed (email ok): ' + (results.failed.find(x=>x.id===recordId && x.channel==='sms')?.reason || 'unknown'));
      } else {
        await clearSendError(env, recordId);
      }

      if (emailOk || smsOk) results.waitlisted++;
    } catch (err) {
      console.error(`Waitlist failed for ${recordId}:`, err);
      results.failed.push({ id: recordId, channel: 'general', reason: err.message });
    }
  }

  return jsonOk(results);
});
