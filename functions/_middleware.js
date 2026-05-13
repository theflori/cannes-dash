// deploy-marker 1778406072-hardened
// Protects everything except /login and /api/login
// If user has valid session cookie -> pass through
// Otherwise -> redirect to /login
//
// HARDENED: top-level try/catch. Any unexpected error returns
// a structured JSON 500 (for /api/*) or 302 to /login (for pages)
// instead of a bare runtime 500.

export async function onRequest(context) {
  try {
    return await routeRequest(context);
  } catch (err) {
    const msg = (err && err.message) || String(err);
    console.error('[middleware] uncaught:', msg, '\n', err && err.stack);
    const url = new URL(context.request.url);
    if (url.pathname.startsWith('/api/')) {
      return new Response(
        JSON.stringify({
          error: 'middleware-failed',
          message: msg.substring(0, 500)
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return Response.redirect(new URL('/login', url).toString(), 302);
  }
}

async function routeRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // Public routes that don't need auth
  const publicRoutes = ['/login', '/api/login', '/api/logout', '/login.html', '/api/healthcheck'];
  if (publicRoutes.some(p => url.pathname === p || url.pathname.startsWith(p + '/'))) {
    return next();
  }

  // Stripe webhook posts from Stripe servers, not from a logged-in browser session.
  // It MUST stay public — Stripe verifies via signature header instead of cookie.
  if (url.pathname === '/api/stripe/webhook') {
    return next();
  }

  // Allow static assets (favicon etc) without auth
  const staticAssets = ['/favicon.ico', '/robots.txt'];
  if (staticAssets.includes(url.pathname)) {
    return next();
  }

  // Allow shared assets (theme.css, app.js, sidebar.html) without auth
  // — needed for login page to render properly
  if (url.pathname.startsWith('/shared/')) {
    return next();
  }

  // Check session cookie
  const cookies = parseCookies(request.headers.get('Cookie') || '');
  const session = cookies['cp_session'];

  if (!session) {
    return redirectToLogin(url);
  }

  // Guard against missing SESSION_SECRET — would otherwise crash verifySession
  if (!env.SESSION_SECRET) {
    console.error('[middleware] SESSION_SECRET not set');
    if (url.pathname.startsWith('/api/')) {
      return new Response(
        JSON.stringify({ error: 'server-misconfigured', message: 'SESSION_SECRET missing' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return redirectToLogin(url);
  }

  const isValid = await verifySession(session, env.SESSION_SECRET);
  if (!isValid) {
    return redirectToLogin(url);
  }

  // Authenticated -> proceed
  return next();
}

function parseCookies(cookieHeader) {
  const cookies = {};
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name) cookies[name] = rest.join('=');
  });
  return cookies;
}

function redirectToLogin(url) {
  // For API calls, return 401 JSON
  if (url.pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  // For page navigation, redirect
  return Response.redirect(new URL('/login', url).toString(), 302);
}

async function verifySession(token, secret) {
  if (!secret) return false;
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;

    const data = JSON.parse(atob(payload));
    if (!data.exp || data.exp < Date.now()) return false;

    const expectedSig = await hmac(payload, secret);
    return signature === expectedSig;
  } catch {
    return false;
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
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}
