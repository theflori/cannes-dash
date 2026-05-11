// deploy-marker reminder-24h-v1
// POST /api/messaging/send-24h-reminder
// Body: { recordIds?: string[] }  (optional - if missing, sends to ALL Approved)
//
// Sends 24h reminder email + SMS to approved guests.
// REVEALS the address. Updates "24h Reminder Sent At" field.
// QR code: passes qrCodeImageUrl placeholder (empty until door system built).

import {
  airtableGet, airtablePatch,
  sendEmail, sendSms, normalizePhone,
  generateUniqueCode,
  jsonError, jsonOk
} from '../../_lib/messaging-utils.js';
import { render24hReminderEmail, render24hReminderSms } from '../../_lib/templates.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  const required = ['AIRTABLE_TOKEN', 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_NAME', 'RESEND_API_KEY'];
  for (const k of required) {
    if (!env[k]) return jsonError(`Missing env: ${k}`, 500);
  }

  let body;
  try { body = await request.json(); } catch { body = {}; }

  let recordIds = Array.isArray(body.recordIds) ? body.recordIds.filter(x => typeof x === 'string') : null;

  // If no recordIds provided, fetch all Approved records
  if (!recordIds || recordIds.length === 0) {
    const formula = encodeURIComponent(`{Messaging Status}="Approved"`);
    const url = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_NAME}?filterByFormula=${formula}&pageSize=100`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}` } });
    if (!res.ok) return jsonError('Could not list approved guests', 500);
    const data = await res.json();
    recordIds = (data.records || []).map(r => r.id);
  }

  if (recordIds.length === 0) return jsonError('No approved guests to notify', 400);
  if (recordIds.length > 250) return jsonError('Too many records (max 250)', 400);

  const results = {
    notified: 0, emailSent: 0, smsSent: 0,
    failed: [], skipped: []
  };

  for (const recordId of recordIds) {
    try {
      const record = await airtableGet(env, recordId);
      const f = record.fields || {};

      if (f['Messaging Status'] !== 'Approved') {
        results.skipped.push({ id: recordId, reason: 'not-approved' });
        continue;
      }

      const email = (f['Email'] || '').trim();
      const phone = normalizePhone(f['Phone'] || '');
      const name = f['Full Name'] || 'Guest';

      if (!email) {
        results.skipped.push({ id: recordId, reason: 'missing-email' });
        continue;
      }

      let declineCode = f['Decline Code'];
      if (!declineCode) {
        declineCode = await generateUniqueCode(env, 'Decline Code');
      }

      // QR code placeholder - currently empty. When door check-in is built,
      // generate a QR PNG URL here and pass it.
      const qrCodeImageUrl = null;

      let emailOk = false;
      try {
        const c = render24hReminderEmail({ name, declineCode, qrCodeImageUrl });
        await sendEmail(env, { to: email, subject: c.subject, html: c.html, text: c.text });
        emailOk = true;
        results.emailSent++;
      } catch (err) {
        console.error(`24h reminder email failed for ${recordId}:`, err.message);
        results.failed.push({ id: recordId, channel: 'email', reason: err.message });
      }

      let smsOk = false;
      if (phone && env.TWILIO_ACCOUNT_SID) {
        try {
          const smsBody = render24hReminderSms({ name, declineCode });
          await sendSms(env, { to: phone, body: smsBody });
          smsOk = true;
          results.smsSent++;
        } catch (err) {
          console.error(`24h reminder SMS failed for ${recordId}:`, err.message);
          results.failed.push({ id: recordId, channel: 'sms', reason: err.message });
        }
      }

      const updateFields = {
        '24h Reminder Sent At': new Date().toISOString()
      };
      if (!f['Decline Code']) updateFields['Decline Code'] = declineCode;
      await airtablePatch(env, recordId, updateFields);

      if (emailOk || smsOk) results.notified++;
    } catch (err) {
      console.error(`24h reminder failed for ${recordId}:`, err);
      results.failed.push({ id: recordId, channel: 'general', reason: err.message });
    }
  }

  return jsonOk(results);
}
