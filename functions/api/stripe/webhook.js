// deploy-marker stripe-webhook-v1
// POST /api/stripe/webhook
// Receives Stripe events. On checkout.session.completed:
//   1. Mark Airtable record as Has Paid=true, Paid At, Stripe Session ID
//   2. Set Messaging Status = Approved
//   3. Generate Decline Code + Plus One Code if missing
//   4. Send confirmation email + SMS (DE only)
//
// Required ENV:
//   STRIPE_WEBHOOK_SECRET - whsec_...
//   AIRTABLE_TOKEN, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME
//   RESEND_API_KEY, TWILIO_*

import {
  airtableGet, airtablePatch,
  sendEmail, sendSms, normalizePhone,
  generateUniqueCode,
  markSendError, clearSendError,
  jsonError, jsonOk
} from '../../_lib/messaging-utils.js';
import { renderConfirmationEmail, renderConfirmationSms } from '../../_lib/templates.js';

export async function onRequestPost(context) {
  try {
    return await handleWebhook(context);
  } catch (err) {
    const msg = (err && err.message) || String(err);
    console.error('[stripe webhook] uncaught:', msg, '\n', err && err.stack);
    // Return 500 with JSON body so Stripe sees a structured error and we never
    // emit a bare 500 that could mask the real cause.
    return new Response(
      JSON.stringify({ error: 'webhook-failed', message: msg.substring(0, 500) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function handleWebhook(context) {
  const { request, env } = context;
  const signature = request.headers.get('stripe-signature') || '';
  const rawBody = await request.text();

  if (!env.STRIPE_WEBHOOK_SECRET) {
    return jsonError('Missing STRIPE_WEBHOOK_SECRET', 500);
  }

  // Verify signature
  const ok = await verifyStripeSignature(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!ok) return jsonError('Invalid signature', 400);

  let event;
  try { event = JSON.parse(rawBody); }
  catch { return jsonError('Invalid JSON', 400); }

  if (event.type !== 'checkout.session.completed') {
    return jsonOk({ ignored: true, type: event.type });
  }

  const session = event.data?.object || {};
  const recordId = session.client_reference_id || session.metadata?.record_id;
  const sessionId = session.id;
  if (!recordId) {
    console.error('[stripe webhook] no record_id on session', sessionId);
    return jsonError('Missing record_id', 400);
  }

  // Idempotency: if already marked paid for this session, do nothing
  let record;
  try { record = await airtableGet(env, recordId); }
  catch (err) { return jsonError('Record not found: ' + err.message, 404); }
  const f = record.fields || {};
  if (f['Has Paid'] === true && f['Stripe Session ID'] === sessionId) {
    return jsonOk({ already_processed: true });
  }

  // Generate codes if missing
  let declineCode = f['Decline Code'] || '';
  let plusOneCode = f['Plus One Code'] || '';
  if (!declineCode) declineCode = await generateUniqueCode(env, 'Decline Code');
  if (!plusOneCode) plusOneCode = await generateUniqueCode(env, 'Plus One Code');

  // Patch Airtable
  await airtablePatch(env, recordId, {
    'Has Paid': true,
    'Paid At': new Date().toISOString(),
    'Stripe Session ID': sessionId,
    'Messaging Status': 'Approved',
    'Decline Code': declineCode,
    'Plus One Code': plusOneCode,
    'Last Message Sent At': new Date().toISOString()
  });

  const email = (f['Email'] || session.customer_email || '').trim();
  const phone = normalizePhone(f['Phone'] || '');
  const name = f['Full Name'] || session.metadata?.name || 'Guest';

  // Send confirmation email
  let emailOk = false;
  if (email) {
    try {
      const { subject, html, text } = renderConfirmationEmail({ name, declineCode, plusOneCode });
      await sendEmail(env, { to: email, subject, html, text });
      emailOk = true;
    } catch (err) {
      console.error('[stripe webhook] confirmation email failed for', recordId, err.message);
    }
  }

  // Send SMS (auto-skipped for non-DE)
  if (phone && env.TWILIO_ACCOUNT_SID) {
    try {
      const smsBody = renderConfirmationSms({ name, declineCode });
      await sendSms(env, { to: phone, body: smsBody });
    } catch (err) {
      console.error('[stripe webhook] SMS failed for', recordId, err.message);
    }
  }

  if (emailOk) await clearSendError(env, recordId);
  else await markSendError(env, recordId, 'Paid but confirmation email failed');

  return jsonOk({ recordId, sessionId, emailOk });
}

// ============== STRIPE WEBHOOK SIGNATURE VERIFICATION ==============
async function verifyStripeSignature(payload, header, secret) {
  if (!header) return false;
  const parts = {};
  for (const seg of header.split(',')) {
    const [k, v] = seg.split('=');
    if (k && v) parts[k.trim()] = v.trim();
  }
  const timestamp = parts.t;
  const expected = parts.v1;
  if (!timestamp || !expected) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    enc.encode(`${timestamp}.${payload}`)
  );
  const hex = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Constant-time comparison
  if (hex.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < hex.length; i++) {
    mismatch |= hex.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}
