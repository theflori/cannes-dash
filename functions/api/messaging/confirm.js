// deploy-marker 1778400136
// POST /api/messaging/confirm
// Body: { recordIds: string[] }
// For each record:
//   1. Set Messaging Status = "Approved"
//   2. Generate decline token + plus-one token
//   3. Save tokens to Airtable
//   4. Send confirmation email (Resend) with personalized links
//   5. Send confirmation SMS (Twilio) with opt-out link
//   6. Update "Last Message Sent At" timestamp

import { signToken, airtableGet, airtablePatch, sendEmail, sendSms, normalizePhone, jsonError, jsonOk, getBaseUrl } from '../../_lib/messaging-utils.js';
import { renderConfirmationEmail, renderConfirmationSms } from '../../_lib/templates.js';

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
  if (recordIds.length > 50) return jsonError('Too many records (max 50 at once)', 400);

  const baseUrl = getBaseUrl(request);
  const results = {
    confirmed: 0,
    emailSent: 0,
    smsSent: 0,
    failed: [],
    skipped: []
  };

  for (const recordId of recordIds) {
    try {
      // 1. Read record
      const record = await airtableGet(env, recordId);
      const f = record.fields || {};

      const email = (f['Email'] || '').trim();
      const phone = normalizePhone(f['Phone'] || '');
      const name = f['Full Name'] || 'Guest';

      if (!email) {
        results.skipped.push({ id: recordId, reason: 'missing-email' });
        continue;
      }

      // 2. Generate tokens (no expiry - links work until used)
      const declineToken = await signToken(
        { rid: recordId, p: 'decline', iat: Date.now() },
        env.SESSION_SECRET
      );
      const plusOneToken = await signToken(
        { rid: recordId, p: 'plusone', iat: Date.now() },
        env.SESSION_SECRET
      );

      const declineUrl = `${baseUrl}/decline?token=${encodeURIComponent(declineToken)}`;
      const plusOneUrl = `${baseUrl}/plus-one?token=${encodeURIComponent(plusOneToken)}`;

      // 3. Send email (Resend)
      let emailOk = false;
      try {
        const emailContent = renderConfirmationEmail({
          name, declineUrl, plusOneUrl
        });
        await sendEmail(env, {
          to: email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        });
        emailOk = true;
        results.emailSent++;
      } catch (err) {
        console.error(`Email failed for ${recordId}:`, err.message);
        results.failed.push({ id: recordId, channel: 'email', reason: err.message });
      }

      // 4. Send SMS (Twilio) — only if phone exists and Twilio configured
      let smsOk = false;
      if (phone && env.TWILIO_ACCOUNT_SID) {
        try {
          const smsBody = renderConfirmationSms({ name, declineUrl });
          await sendSms(env, { to: phone, body: smsBody });
          smsOk = true;
          results.smsSent++;
        } catch (err) {
          console.error(`SMS failed for ${recordId}:`, err.message);
          results.failed.push({ id: recordId, channel: 'sms', reason: err.message });
        }
      }

      // 5. Update Airtable: Status, tokens, timestamp
      await airtablePatch(env, recordId, {
        'Messaging Status': 'Approved',
        'Decline Token': declineToken,
        'Plus One Token': plusOneToken,
        'Last Message Sent At': new Date().toISOString()
      });

      if (emailOk || smsOk) results.confirmed++;
    } catch (err) {
      console.error(`Confirm failed for ${recordId}:`, err);
      results.failed.push({ id: recordId, channel: 'general', reason: err.message });
    }
  }

  return jsonOk(results);
}
