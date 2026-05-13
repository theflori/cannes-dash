// deploy-marker healthcheck-diag-v1
// GET /api/healthcheck
// Plain endpoint — public (no auth). If this returns 500, the build itself is broken.
// Lists which env vars and bindings are configured so you can see misconfig without
// access to the Cloudflare dashboard logs.
//
// Safe: never reveals secret VALUES, only presence/absence.

import { safe } from '../_lib/safe-handler.js';
export const onRequestGet = safe("GET /api/healthcheck", async (context) => {
  const { env } = context;

  const expectedEnvVars = [
    'SESSION_SECRET',
    'DASHBOARD_PASSWORD',
    'AIRTABLE_TOKEN',
    'AIRTABLE_BASE_ID',
    'AIRTABLE_TABLE_NAME',
    'APIFY_TOKEN',
    'RESEND_API_KEY',
    'RESEND_FROM',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_SECRET_KEY'
  ];

  const expectedBindings = ['ASSETS']; // R2 bucket

  const envStatus = {};
  for (const k of expectedEnvVars) {
    envStatus[k] = typeof env[k] === 'string' && env[k].length > 0 ? 'set' : 'MISSING';
  }

  const bindingStatus = {};
  for (const k of expectedBindings) {
    bindingStatus[k] = env[k] ? 'bound' : 'MISSING';
  }

  return new Response(JSON.stringify({
    ok: true,
    timestamp: new Date().toISOString(),
    message: 'healthcheck — if you see this, the build deployed',
    env: envStatus,
    bindings: bindingStatus
  }, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
});
