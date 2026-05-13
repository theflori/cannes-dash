// deploy-marker 1778506899
// POST /api/messaging/confirm
// Body: { recordIds: string[] }
// For each record:
//   1. Generate 6-char Decline Code + Plus One Code
//   2. Save codes to Airtable + set Messaging Status = Approved
//   3. Send confirmation email + SMS (with short URLs)

import {
  airtableGet, airtablePatch,
  sendEmail, sendSms, normalizePhone,
  generateUniqueCode,
  markSendError, markSendWarning, clearSendError,
  jsonError, jsonOk
} from '../../_lib/messaging-utils.js';
import { renderConfirmationEmail, renderConfirmationSms } from '../../_lib/templates.js';

import { safe } from '../../_lib/safe-handler.js';
export const onRequestPost = safe("POST /api/messaging/confirm", async (context) => {
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

  const results = {
    confirmed: 0, emailSent: 0, smsSent: 0,
    failed: [], skipped: []
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

      // Generate fresh codes (re-issue on every send, so old codes invalid)
      const declineCode = await generateUniqueCode(env, 'Decline Code');
      const plusOneCode = await generateUniqueCode(env, 'Plus One Code');

      // Send Email
      let emailOk = false;
      try {
        const c = renderConfirmationEmail({ name, declineCode, plusOneCode });
        await sendEmail(env, { to: email, subject: c.subject, html: c.html, text: c.text });
        emailOk = true;
        results.emailSent++;
      } catch (err) {
        console.error(`Confirm email failed for ${recordId}:`, err.message);
        results.failed.push({ id: recordId, channel: 'email', reason: err.message });
      }

      // Send SMS
      let smsOk = false;
      if (phone && env.TWILIO_ACCOUNT_SID) {
        try {
          const smsBody = renderConfirmationSms({ name, declineCode });
          await sendSms(env, { to: phone, body: smsBody });
          smsOk = true;
          results.smsSent++;
        } catch (err) {
          console.error(`Confirm SMS failed for ${recordId}:`, err.message);
          results.failed.push({ id: recordId, channel: 'sms', reason: err.message });
        }
      }

      // Save codes + status + timestamp
      await airtablePatch(env, recordId, {
        'Messaging Status': 'Approved',
        'Decline Code': declineCode,
        'Plus One Code': plusOneCode,
        'Last Message Sent At': new Date().toISOString()
      });

      // Track outcome on the guest record (visible in dashboard)
      if (!emailOk) {
        await markSendError(env, recordId, 'Confirm email failed: ' + (results.failed.find(x=>x.id===recordId && x.channel==='email')?.reason || 'unknown'));
      } else if (phone && env.TWILIO_ACCOUNT_SID && !smsOk) {
        await markSendWarning(env, recordId, 'SMS failed (email ok): ' + (results.failed.find(x=>x.id===recordId && x.channel==='sms')?.reason || 'unknown'));
      } else {
        await clearSendError(env, recordId);
      }

      if (emailOk || smsOk) results.confirmed++;
    } catch (err) {
      console.error(`Confirm failed for ${recordId}:`, err);
      results.failed.push({ id: recordId, channel: 'general', reason: err.message });
    }
  }

  return jsonOk(results);
});
