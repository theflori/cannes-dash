// deploy-marker 1778315340
// POST /api/login with { password }
// On success, sets cp_session cookie (30 days)

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DASHBOARD_PASSWORD || !env.SESSION_SECRET) {
    return jsonError('Server not configured. Missing DASHBOARD_PASSWORD or SESSION_SECRET.', 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const submittedPassword = (body.password || '').trim();

  // Constant-time compare to mitigate timing attacks
  if (!constantTimeEqual(submittedPassword, env.DASHBOARD_PASSWORD)) {
    // Small delay to slow brute-force
    await new Promise(r => setTimeout(r, 800));
    return jsonError('Invalid password', 401);
  }

  // Build session token: base64(payload).hmac(payload)
  const payload = btoa(JSON.stringify({
    iat: Date.now(),
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000  // 30 days
  }));
  const signature = await hmac(payload, env.SESSION_SECRET);
  const token = `${payload}.${signature}`;

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `cp_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
    }
  });
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function hmac(message, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}
