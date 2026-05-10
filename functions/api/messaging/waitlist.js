// deploy-marker 1778400849
// POST /api/messaging/waitlist
// Body: { recordIds: string[] }
// For each record:
//   1. Set Messaging Status = "Waitlist"
//   2. Generate decline token
//   3. Save to Airtable
//   4. Send waitlist email + SMS

import { signToken, airtableGet, airtablePatch, sendEmail, sendSms, normalizePhone, jsonError, jsonOk, getBaseUrl } from '../../_lib/messaging-utils.js';
import { renderWaitlistEmail, renderWaitlistSms } from '../../_lib/templates.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  const required = ['AIRTABLE_TOKEN', 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_NAME', 'SESSION_SECRET', 'RESEND_API_KEY'];
  for (const k of required) {
    if (!env[k]) return jsonError(`Missing env: ${k}`, 500);
  }

  let body;
  try { body = await request.json(); }
  catch { return jsonError('Invalid JSON', 400); }

  const recordIds = Array.isArray(body.recordIds) ? body.recordIds.filter(x => typeof x === 'string') : [];
  if (recordIds.length === 0) return jsonError('Missing recordIds', 400);
  if (recordIds.length > 50) return jsonError('Too many records (max 50)', 400);

  const baseUrl = getBaseUrl(request);
  const results = {
    waitlisted: 0,
    emailSent: 0,
    smsSent: 0,
    failed: [],
    skipped: []
  };

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

      // Generate decline token (no plus-one for waitlist guests)
      const declineToken = await signToken(
        { rid: recordId, p: 'decline', iat: Date.now() },
        env.SESSION_SECRET
      );
      const declineUrl = `${baseUrl}/decline?token=${encodeURIComponent(declineToken)}`;

      // Send Email
      let emailOk = false;
      try {
        const emailContent = renderWaitlistEmail({ name, declineUrl });
        await sendEmail(env, {
          to: email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        });
        emailOk = true;
        results.emailSent++;
      } catch (err) {
        console.error(`Waitlist email failed for ${recordId}:`, err.message);
        results.failed.push({ id: recordId, channel: 'email', reason: err.message });
      }

      // Send SMS
      let smsOk = false;
      if (phone && env.TWILIO_ACCOUNT_SID) {
        try {
          const smsBody = renderWaitlistSms({ name, declineUrl });
          await sendSms(env, { to: phone, body: smsBody });
          smsOk = true;
          results.smsSent++;
        } catch (err) {
          console.error(`Waitlist SMS failed for ${recordId}:`, err.message);
          results.failed.push({ id: recordId, channel: 'sms', reason: err.message });
        }
      }

      // Update Airtable
      await airtablePatch(env, recordId, {
        'Messaging Status': 'Waitlist',
        'Decline Token': declineToken,
        'Last Message Sent At': new Date().toISOString()
      });

      if (emailOk || smsOk) results.waitlisted++;
    } catch (err) {
      console.error(`Waitlist failed for ${recordId}:`, err);
      results.failed.push({ id: recordId, channel: 'general', reason: err.message });
    }
  }

  return jsonOk(results);
}
