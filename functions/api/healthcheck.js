// Plain endpoint without imports — if this returns 500, the problem is NOT in Claude's code.
export async function onRequestGet() {
  return new Response(JSON.stringify({
    ok: true,
    timestamp: new Date().toISOString(),
    message: 'healthcheck — if you see this, the build deployed'
  }), { headers: { 'Content-Type': 'application/json' } });
}
