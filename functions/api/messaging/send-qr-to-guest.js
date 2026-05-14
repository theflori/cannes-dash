// deploy-marker manual-send-qr-v1
// POST /api/messaging/send-qr-to-guest
// Body: { recordId: string }
//
// Manually sends the event-details + QR email (same as 24h reminder)
// to a single approved guest. Updates "QR Sent At".

import {
  airtableGet, airtablePatch,
  sendEmail, sendSms, normalizePhone,
  generateUniqueCode,
  jsonError, jsonOk
} from '../../_lib/messaging-utils.js';
import { ensureQrCode } from '../../_lib/checkin-utils.js';
import { render24hReminderEmail, render24hReminderSms } from '../../_lib/templates.js';

function buildQrImageUrl(qrCode) {
  const payload = encodeURIComponent(qrCode);
  return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=H&margin=10&data=${payload}`;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const required = ['AIRTABLE_TOKEN', 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_NAME', 'RESEND_API_KEY'];
  for (const k of required) {
    if (!env[k]) return jsonError(`Missing env: ${k}`, 500);
  }

  let body;
  try { body = await request.json(); }
  catch { return jsonError('Invalid JSON', 400); }

  const recordId = body.recordId;
  if (!recordId || typeof recordId !== 'string') return jsonError('Missing recordId', 400);

  let record;
  try { record = await airtableGet(env, recordId); }
  catch (err) { return jsonError('Record not found: ' + err.message, 404); }

  const f = record.fields || {};

  // We allow sending to anyone with an email — staff might want to test
  // by sending themselves the QR mail. Just warn if status is unusual.
  const email = (f['Email'] || '').trim();
  if (!email) return jsonError('Guest has no email address', 400);

  const name = f['Full Name'] || 'Guest';
  const phone = normalizePhone(f['Phone'] || '');

  let declineCode = f['Decline Code'];
  if (!declineCode) {
    declineCode = await generateUniqueCode(env, 'Decline Code');
  }

  const qrCode = await ensureQrCode(env, recordId);
  const qrCodeImageUrl = buildQrImageUrl(qrCode);

  const result = { emailSent: false, smsSent: false, qrCode, errors: [] };

  try {
    const c = render24hReminderEmail({ name, declineCode, qrCodeImageUrl });
    await sendEmail(env, { to: email, subject: c.subject, html: c.html, text: c.text });
    result.emailSent = true;
  } catch (err) {
    result.errors.push({ channel: 'email', message: err.message });
  }

  if (phone && env.TWILIO_ACCOUNT_SID) {
    try {
      const smsBody = render24hReminderSms({ name, declineCode });
      await sendSms(env, { to: phone, body: smsBody });
      result.smsSent = true;
    } catch (err) {
      result.errors.push({ channel: 'sms', message: err.message });
    }
  }

  // Mark sent + ensure decline code is saved
  const patch = { 'QR Sent At': new Date().toISOString() };
  if (!f['Decline Code']) patch['Decline Code'] = declineCode;
  await airtablePatch(env, recordId, patch);

  return jsonOk(result);
}
