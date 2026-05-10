// deploy-marker 1778398832
// Email & SMS templates for messaging flows.
// All copy in English, brand-styled HTML for emails.

import { escapeHtml } from './messaging-utils.js';

// ============== CONFIRMATION (when status set to Approved) ==============

export function renderConfirmationEmail({ name, declineUrl, plusOneUrl }) {
  const firstName = (name || '').split(' ')[0] || 'there';

  const subject = "You're confirmed · Château Privé · Cannes · 15 May 2026";

  const text = `Hi ${firstName},

You're officially on the list for Château Privé.

Friday, 15 May 2026 · Cannes Californie · A private château

Doors:
- 16:00 — Setters wave
- 17:00 — Main wave
- 18:00 — Hard close. No entry after.

What you should know:
- Outdoor + Orangerie only
- One signature drink, Champagne, three spirits
- Live act at 21:15 — please don't share
- Hard cut at 04:00

The exact address will be sent 48 hours before the event by SMS.

Bring someone with you (one person max):
${plusOneUrl}

Can't make it after all?
${declineUrl}

— Château Privé
`;

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F1ECDF;font-family:'Helvetica Neue',Arial,sans-serif;color:#1A1612;line-height:1.5">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F1ECDF;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#FBF7EC;border:1px solid rgba(26,22,18,0.08);border-radius:8px;overflow:hidden">

        <!-- Header -->
        <tr><td style="padding:48px 40px 32px;text-align:center;border-bottom:1px solid rgba(26,22,18,0.08)">
          <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:32px;color:#9a7d44;letter-spacing:0.02em">Château Privé</div>
          <div style="margin-top:8px;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#8a8270">Cannes · 15 May 2026</div>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding:40px 40px 24px">
          <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:24px;color:#1A1612;margin-bottom:8px">${escapeHtml(firstName)},</div>
          <p style="margin:0;font-size:15px;color:#1A1612;line-height:1.6">
            You're officially on the list for Château Privé.
          </p>
        </td></tr>

        <!-- Event Details Box -->
        <tr><td style="padding:0 40px 32px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(184,150,90,0.06);border:1px solid rgba(184,150,90,0.18);border-radius:6px">
            <tr><td style="padding:24px 28px">
              <div style="font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#9a7d44;margin-bottom:14px">When &amp; where</div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:22px;color:#1A1612;margin-bottom:6px">Friday, 15 May 2026</div>
              <div style="font-size:14px;color:#4a4337;margin-bottom:20px">A private château · Cannes Californie</div>

              <div style="font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#9a7d44;margin-bottom:10px">Doors</div>
              <div style="font-size:14px;color:#1A1612;line-height:1.7">
                <strong style="color:#9a7d44">16:00</strong> — Setters wave<br>
                <strong style="color:#9a7d44">17:00</strong> — Main wave<br>
                <strong style="color:#9a7d44">18:00</strong> — Hard close. No entry after.
              </div>
            </td></tr>
          </table>
        </td></tr>

        <!-- Notes -->
        <tr><td style="padding:0 40px 32px">
          <div style="font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#8a8270;margin-bottom:12px">What you should know</div>
          <ul style="margin:0;padding:0 0 0 18px;font-size:14px;color:#1A1612;line-height:1.7">
            <li>Outdoor and Orangerie only</li>
            <li>One signature drink, Champagne, three spirits</li>
            <li>Live act at 21:15 — please don't share</li>
            <li>Hard cut at 04:00</li>
          </ul>
          <p style="margin:18px 0 0;font-size:13px;color:#4a4337;font-style:italic">
            The exact address will be sent 48 hours before the event by SMS.
          </p>
        </td></tr>

        <!-- Plus One CTA -->
        <tr><td style="padding:0 40px 24px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:20px 24px;background:#1A1612;border-radius:6px">
              <div style="font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#B8965A;margin-bottom:8px">Bring someone</div>
              <div style="font-family:Georgia,serif;font-style:italic;font-size:18px;color:#F1ECDF;margin-bottom:14px">Add one person to your invitation.</div>
              <a href="${escapeHtml(plusOneUrl)}" style="display:inline-block;padding:11px 24px;background:#B8965A;color:#1A1612;text-decoration:none;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;font-weight:500;border-radius:4px">Add a person</a>
              <div style="margin-top:10px;font-size:11px;color:rgba(241,236,223,0.6)">One additional person maximum.</div>
            </td></tr>
          </table>
        </td></tr>

        <!-- Decline -->
        <tr><td style="padding:0 40px 40px;text-align:center">
          <p style="margin:0;font-size:12px;color:#8a8270">
            Can't make it after all?
            <a href="${escapeHtml(declineUrl)}" style="color:#9a7d44;text-decoration:underline">Let us know</a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 40px;background:rgba(26,22,18,0.03);text-align:center;border-top:1px solid rgba(26,22,18,0.08)">
          <div style="font-family:Georgia,serif;font-style:italic;font-size:14px;color:#9a7d44">Château Privé</div>
          <div style="margin-top:6px;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#8a8270">Memory as status symbol</div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

// ============== SMS (short, ~160 chars) ==============

export function renderConfirmationSms({ name, declineUrl }) {
  const firstName = (name || '').split(' ')[0] || '';
  // Shorten URL for SMS — full URL is ok, just don't add fluff
  return `${firstName ? firstName + ', ' : ''}you're confirmed for Château Privé · 15 May · Cannes. Details in your email. Can't make it? ${declineUrl}`;
}

// ============== WAITLIST ==============

export function renderWaitlistEmail({ name }) {
  const firstName = (name || '').split(' ')[0] || 'there';
  const subject = "Waitlist · Château Privé · Cannes";

  const text = `Hi ${firstName},

Thank you for your interest in Château Privé.

We've placed you on the waitlist for now. We'll be in touch in the coming days as we finalize the guest list — if a spot opens up, you'll hear from us first.

— Château Privé
`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F1ECDF;font-family:'Helvetica Neue',Arial,sans-serif;color:#1A1612">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1ECDF;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background:#FBF7EC;border:1px solid rgba(26,22,18,0.08);border-radius:8px">
        <tr><td style="padding:48px 40px;text-align:center;border-bottom:1px solid rgba(26,22,18,0.08)">
          <div style="font-family:Georgia,serif;font-style:italic;font-size:32px;color:#9a7d44">Château Privé</div>
          <div style="margin-top:8px;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#8a8270">Cannes · 15 May 2026</div>
        </td></tr>
        <tr><td style="padding:40px">
          <div style="font-family:Georgia,serif;font-style:italic;font-size:24px;color:#1A1612;margin-bottom:14px">${escapeHtml(firstName)},</div>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6">Thank you for your interest in Château Privé.</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6">We've placed you on the <strong>waitlist</strong> for now. We'll be in touch in the coming days as we finalize the guest list — if a spot opens up, you'll hear from us first.</p>
        </td></tr>
        <tr><td style="padding:24px 40px;background:rgba(26,22,18,0.03);text-align:center;border-top:1px solid rgba(26,22,18,0.08)">
          <div style="font-family:Georgia,serif;font-style:italic;font-size:14px;color:#9a7d44">Château Privé</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, text, html };
}

// ============== PLUS-ONE WELCOME (sent to Plus-One after registration) ==============

export function renderPlusOneWelcomeEmail({ name, primaryName, declineUrl }) {
  const firstName = (name || '').split(' ')[0] || 'there';
  const subject = "You're confirmed · Château Privé · Cannes · 15 May 2026";

  const text = `Hi ${firstName},

${primaryName} added you as their guest for Château Privé.

Friday, 15 May 2026 · Cannes Californie · A private château

Doors:
- 16:00 — Setters wave
- 17:00 — Main wave
- 18:00 — Hard close. No entry after.

The exact address will be sent 48 hours before the event by SMS.

Can't make it?
${declineUrl}

— Château Privé
`;

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F1ECDF;font-family:'Helvetica Neue',Arial,sans-serif;color:#1A1612">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1ECDF;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#FBF7EC;border:1px solid rgba(26,22,18,0.08);border-radius:8px">
        <tr><td style="padding:48px 40px 32px;text-align:center;border-bottom:1px solid rgba(26,22,18,0.08)">
          <div style="font-family:Georgia,serif;font-style:italic;font-size:32px;color:#9a7d44">Château Privé</div>
          <div style="margin-top:8px;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#8a8270">Cannes · 15 May 2026</div>
        </td></tr>
        <tr><td style="padding:40px">
          <div style="font-family:Georgia,serif;font-style:italic;font-size:24px;color:#1A1612;margin-bottom:14px">${escapeHtml(firstName)},</div>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.6"><strong>${escapeHtml(primaryName)}</strong> added you as their guest for Château Privé.</p>

          <table role="presentation" width="100%" style="background:rgba(184,150,90,0.06);border:1px solid rgba(184,150,90,0.18);border-radius:6px;margin:24px 0">
            <tr><td style="padding:24px">
              <div style="font-family:Georgia,serif;font-style:italic;font-size:22px;color:#1A1612;margin-bottom:6px">Friday, 15 May 2026</div>
              <div style="font-size:14px;color:#4a4337;margin-bottom:20px">Cannes Californie · A private château</div>
              <div style="font-size:13px;line-height:1.8;color:#1A1612">
                <strong style="color:#9a7d44">16:00</strong> Setters wave<br>
                <strong style="color:#9a7d44">17:00</strong> Main wave<br>
                <strong style="color:#9a7d44">18:00</strong> Hard close
              </div>
            </td></tr>
          </table>

          <p style="margin:0;font-size:13px;color:#4a4337;font-style:italic">The exact address will be sent 48 hours before the event by SMS.</p>
        </td></tr>
        <tr><td style="padding:0 40px 32px;text-align:center">
          <p style="margin:0;font-size:12px;color:#8a8270">
            Can't make it? <a href="${escapeHtml(declineUrl)}" style="color:#9a7d44;text-decoration:underline">Let us know</a>
          </p>
        </td></tr>
        <tr><td style="padding:24px 40px;background:rgba(26,22,18,0.03);text-align:center;border-top:1px solid rgba(26,22,18,0.08)">
          <div style="font-family:Georgia,serif;font-style:italic;font-size:14px;color:#9a7d44">Château Privé</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject, text, html };
}

export function renderPlusOneWelcomeSms({ name, primaryName, declineUrl }) {
  const firstName = (name || '').split(' ')[0] || '';
  return `${firstName ? firstName + ', ' : ''}${primaryName} added you to Château Privé · 15 May · Cannes. Details in your email. Can't make it? ${declineUrl}`;
}
