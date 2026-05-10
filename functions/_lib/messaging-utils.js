// deploy-marker 1778400849
// Shared utilities for messaging — HMAC tokens, email & SMS senders

// ============== TOKENS ==============

// Generate a signed token: base64(payload).base64(hmac)
// payload = { recordId, purpose, exp }
export async function signToken(payload, secret) {
  const data = btoa(JSON.stringify(payload));
  const sig = await hmac(data, secret);
  return `${data}.${sig}`;
}

export async function verifyToken(token, secret, expectedPurpose) {
  try {
    if (!token || typeof token !== 'string') return null;
    const [data, sig] = token.split('.');
    if (!data || !sig) return null;
    const expectedSig = await hmac(data, secret);
    if (sig !== expectedSig) return null;

    const payload = JSON.parse(atob(data));
    if (payload.exp && payload.exp < Date.now()) return null;
    if (expectedPurpose && payload.purpose !== expectedPurpose) return null;

    return payload;
  } catch {
    return null;
  }
}

async function hmac(message, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

// ============== AIRTABLE HELPERS ==============

export async function airtableGet(env, recordId) {
  const url = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_NAME}/${recordId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable GET ${res.status}: ${text.substring(0, 200)}`);
  }
  return await res.json();
}

export async function airtablePatch(env, recordId, fields) {
  const url = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_NAME}/${recordId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields, typecast: true })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable PATCH ${res.status}: ${text.substring(0, 200)}`);
  }
  return await res.json();
}

export async function airtableCreate(env, fields) {
  const url = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_NAME}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields, typecast: true })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Airtable CREATE ${res.status}: ${text.substring(0, 200)}`);
  }
  return await res.json();
}

// ============== RESEND ==============

export async function sendEmail(env, { to, subject, html, text }) {
  if (!env.RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured');

  const from = env.RESEND_FROM || 'Château Privé <rsvp@fraimit.com>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from, to, subject, html, text })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend ${res.status}: ${errText.substring(0, 200)}`);
  }

  return await res.json();
}

// ============== TWILIO ==============

export async function sendSms(env, { to, body }) {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_PHONE_NUMBER) {
    throw new Error('Twilio credentials not configured');
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
  const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);

  const params = new URLSearchParams();
  params.append('To', to);
  params.append('From', env.TWILIO_PHONE_NUMBER);
  params.append('Body', body);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Twilio ${res.status}: ${errText.substring(0, 300)}`);
  }

  return await res.json();
}

// ============== PHONE NORMALIZATION ==============

export function normalizePhone(raw) {
  if (!raw) return '';
  let p = String(raw).trim().replace(/[^\d+]/g, '');
  // If starts with 00, replace with +
  if (p.startsWith('00')) p = '+' + p.substring(2);
  // If no +, assume DE (most likely user base)
  if (!p.startsWith('+') && p.startsWith('0')) {
    p = '+49' + p.substring(1);
  } else if (!p.startsWith('+')) {
    p = '+' + p;
  }
  return p;
}

// ============== HELPERS ==============

export function jsonError(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function jsonOk(payload) {
  return new Response(JSON.stringify({ ok: true, ...payload }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export function getBaseUrl(request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
