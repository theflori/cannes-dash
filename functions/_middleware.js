// deploy-marker 1778406072-minimal
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
    // Never let the middleware itself produce a bare 500.
    // Log the failure and let the user back to /login instead of a dead end.
    console.error('[middleware] uncaught on', url.pathname, '-', (err && err.message) || err);
    if (url.pathname.startsWith('/api/')) {
      return new Response(
        JSON.stringify({
          error: 'middleware-failed',
          path: url.pathname,
          message: ((err && err.message) || String(err)).substring(0, 500)
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // For page navigation: clear the (possibly corrupt) session cookie and
    // send them to /login. Avoids redirect loops if /login itself fails.
    if (url.pathname === '/login' || url.pathname === '/login.html') {
      return new Response(
        'Login page failed to load. Error: ' + ((err && err.message) || String(err)),
        { status: 500, headers: { 'Content-Type': 'text/plain' } }
      );
    }
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/login',
        'Set-Cookie': 'cp_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
      }
    });
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
