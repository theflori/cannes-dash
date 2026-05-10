// deploy-marker 1778400136
// POST /api/messaging/send
// Body: { recordIds: string[] }
//
// Reads each guest's current Messaging Status and sends the matching SMS+Email:
//   - Approved → Confirmation flow (Email + SMS with decline + plus-one links)
//   - Waitlist → Waitlist flow (Email + SMS with decline link only)
//   - Listed / Semi Approved / Declined → SKIPPED (no template)
//
// Does NOT change Messaging Status. Only sends.
// (Use /api/messaging/confirm to set status=Approved AND send in one step.)

import {
  signToken, airtableGet, airtablePatch,
  sendEmail, sendSms, normalizePhone,
  jsonError, jsonOk, getBaseUrl
} from '../../_lib/messaging-utils.js';
import {
  renderConfirmationEmail, renderConfirmationSms,
  renderWaitlistEmail, renderWaitlistSms
} from '../../_lib/templates.js';

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
    sent: 0,
    emailSent: 0,
    smsSent: 0,
    skipped: [],
    failed: []
  };

  for (const recordId of recordIds) {
    try {
      const record = await airtableGet(env, recordId);
      const f = record.fields || {};

      const messagingStatus = f['Messaging Status'] || '';
      const email = (f['Email'] || '').trim();
      const phone = normalizePhone(f['Phone'] || '');
      const name = f['Full Name'] || 'Guest';

      // Skip if no template applies
      if (messagingStatus !== 'Approved' && messagingStatus !== 'Waitlist') {
        results.skipped.push({
          id: recordId,
          reason: messagingStatus
            ? `no-template-for-status:${messagingStatus}`
            : 'no-messaging-status'
        });
        continue;
      }

      if (!email) {
        results.skipped.push({ id: recordId, reason: 'missing-email' });
        continue;
      }

      // Generate (or reuse) decline + plus-one tokens
      // We re-issue every send so old tokens that may have leaked can be invalidated
      const declineToken = await signToken(
        { rid: recordId, p: 'decline', iat: Date.now() },
        env.SESSION_SECRET
      );
      const declineUrl = `${baseUrl}/decline?token=${encodeURIComponent(declineToken)}`;

      let plusOneToken = '';
      let plusOneUrl = '';
      if (messagingStatus === 'Approved') {
        plusOneToken = await signToken(
          { rid: recordId, p: 'plusone', iat: Date.now() },
          env.SESSION_SECRET
        );
        plusOneUrl = `${baseUrl}/plus-one?token=${encodeURIComponent(plusOneToken)}`;
      }

      // Pick templates
      let emailContent, smsBody;
      if (messagingStatus === 'Approved') {
        emailContent = renderConfirmationEmail({ name, declineUrl, plusOneUrl });
        smsBody = renderConfirmationSms({ name, declineUrl });
      } else if (messagingStatus === 'Waitlist') {
        emailContent = renderWaitlistEmail({ name, declineUrl });
        smsBody = renderWaitlistSms({ name, declineUrl });
      }

      // Send Email
      let emailOk = false;
      try {
        await sendEmail(env, {
          to: email,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text
        });
        emailOk = true;
        results.emailSent++;
      } catch (err) {
        console.error(`Email failed for ${recordId} (${messagingStatus}):`, err.message);
        results.failed.push({ id: recordId, channel: 'email', reason: err.message });
      }

      // Send SMS (if phone + Twilio configured)
      let smsOk = false;
      if (phone && env.TWILIO_ACCOUNT_SID) {
        try {
          await sendSms(env, { to: phone, body: smsBody });
          smsOk = true;
          results.smsSent++;
        } catch (err) {
          console.error(`SMS failed for ${recordId} (${messagingStatus}):`, err.message);
          results.failed.push({ id: recordId, channel: 'sms', reason: err.message });
        }
      }

      // Save tokens + timestamp (no status change)
      const updateFields = {
        'Decline Token': declineToken,
        'Last Message Sent At': new Date().toISOString()
      };
      if (plusOneToken) updateFields['Plus One Token'] = plusOneToken;

      await airtablePatch(env, recordId, updateFields);

      if (emailOk || smsOk) results.sent++;
    } catch (err) {
      console.error(`Send failed for ${recordId}:`, err);
      results.failed.push({ id: recordId, channel: 'general', reason: err.message });
    }
  }

  return jsonOk(results);
}
