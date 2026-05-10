// deploy-marker 1778398832
// POST /api/messaging/send
// Body: { recordIds: string[] }
//
// PHASE 1: This is a stub. Returns "not yet active" so frontend can show toast.
// PHASE 2 will integrate Twilio (SMS) and Resend (Email):
//   - Read each guest's Messaging Status
//   - For status === "Approved": send approved-template via SMS + Email
//   - For status === "Waitlist": send waitlist-template via SMS + Email
//   - For status === "Declined": send decline-confirmation
//   - For status === "Listed" / "Semi Approved": no auto-send (manual review needed)
//   - Approved messages will include a unique signed decline link

export async function onRequestPost(context) {
  const { request } = context;

  let body = {};
  try { body = await request.json(); } catch {}

  const recordIds = Array.isArray(body.recordIds) ? body.recordIds : [];

  // Log the intent for now; will be useful for debugging when Phase 2 is wired up
  console.log('Messaging send request (stub):', { recordIds, count: recordIds.length });

  return new Response(JSON.stringify({
    ok: false,
    stub: true,
    message: 'Messaging send is not active yet. Twilio + Resend will be integrated in Phase 2.',
    receivedIds: recordIds.length
  }), {
    status: 501, // Not Implemented
    headers: { 'Content-Type': 'application/json' }
  });
}
