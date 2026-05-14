// deploy-marker 1778406072-debug
// Protects everything except /login and /api/login
// If user has valid session cookie -> pass through
// Otherwise -> redirect to /login

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  try {
    // Public routes that don't need auth
    const publicRoutes = ['/login', '/api/login', '/api/logout', '/login.html', '/api/healthcheck'];
    if (publicRoutes.some(p => url.pathname === p || url.pathname.startsWith(p + '/'))) {
      return next();
    }

    // Stripe routes are public:
    // - /api/stripe/webhook is called by Stripe servers (no browser session, verified by signature)
    // - /api/stripe/checkout is hit from email links (user may not be logged in to dashboard)
    if (url.pathname === '/api/stripe/webhook' || url.pathname === '/api/stripe/checkout') {
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

    // Verify session token (simple HMAC check)
    const isValid = await verifySession(session, env.SESSION_SECRET);
    if (!isValid) {
      return redirectToLogin(url);
    }

    // Authenticated -> proceed
    return next();
  } catch (err) {
    // DEBUG: surface the actual error instead of a bare 500.
    // This must NEVER appear in normal operation. If you see this in the browser,
    // the middleware itself crashed — the message tells you exactly where.
    const msg = (err && err.message) || String(err);
    const stack = (err && err.stack) || '';
    console.error('[middleware] uncaught on', url.pathname, '-', msg, '\n', stack);
    return new Response(
      JSON.stringify({
        error: 'middleware-crashed',
        path: url.pathname,
        method: request.method,
        message: msg.substring(0, 500),
        stack: stack.substring(0, 1500)
      }, null, 2),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
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
