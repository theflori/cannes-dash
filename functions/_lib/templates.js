// deploy-marker 1778497190
// Email + SMS templates for messaging flows.
// Dark Château Privé style — matches cannescastle email design.
//
// All URLs use the short-code domain: chateau-cannes.fraimit.com/r/{code}

import { escapeHtml } from './messaging-utils.js';

// Base URL where the public decline / plus-one pages live (cannescastle project)
const PUBLIC_BASE = 'https://chateau-cannes.fraimit.com';

// ============== EVENT CONFIG (single source of truth) ==============
// To change the date, doors, or any detail, edit here and redeploy.
// Address is the ONLY field that must NOT appear before the 24h reminder.
const EVENT = {
  dateFull: 'Friday, 15 May 2026',
  dateShort: '15 May 2026',
  dateSms: '15 May',
  doors: '17:00',
  doorsLabel: '17:00 — please be early',
  city: 'Cannes Californie',
  // Address — REVEALED ONLY IN 24H REMINDER. Never reference in other templates.
  address: '43 Av. du Roi Albert 1er, 06400 Cannes',
  addressMapsUrl: 'https://maps.google.com/?q=43+Av.+du+Roi+Albert+1er,+06400+Cannes'
};

// ============== HELPERS ==============

function shortUrl(code) {
  return `${PUBLIC_BASE}/r/${code}`;
}

// ============== CONFIRMATION EMAIL ==============

export function renderConfirmationEmail({ name, declineCode, plusOneCode }) {
  const firstName = (name || '').split(' ')[0] || 'there';
  const subject = "You are confirmed — Château Privé · 15 May 2026";
  const declineUrl = shortUrl(declineCode);
  const plusOneUrl = shortUrl(plusOneCode);

  const text = `Dear ${firstName},

Your attendance at Château Privé is confirmed.

Friday, 15 May 2026 · Cannes Californie
Doors at 17:00 — please be early.

The exact address will be shared 24 hours before the event by SMS.

Bring one person — share this link with them, or fill out their details yourself:
${plusOneUrl}

Can't attend? ${declineUrl}

— Château Privé
`;

  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${escapeHtml(subject)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=EB+Garamond:wght@400;500&display=swap" rel="stylesheet">
<style>
@media only screen and (max-width: 620px) {
  .container { width: 100% !important; }
  .px-40 { padding-left: 24px !important; padding-right: 24px !important; }
  .h1 { font-size: 30px !important; line-height: 1.15 !important; }
  .details td { font-size: 14px !important; }
  .details .lbl { width: 90px !important; padding-left: 20px !important; }
  .details .val { padding-right: 20px !important; }
  .py-top { padding-top: 36px !important; padding-bottom: 28px !important; }
}
body { margin: 0; padding: 0; }
</style>
</head>
<body style="margin:0;padding:0;background-color:#0F0C09;font-family:'EB Garamond',Georgia,serif;color:#F1ECDF">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#0F0C09">Your attendance at Château Privé is confirmed. Friday, 15 May 2026.</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0F0C09" style="background-color:#0F0C09">
<tr><td align="center" style="padding:32px 16px">

<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#1A1612">

<!-- Header -->
<tr><td align="center" class="px-40" style="padding:20px 40px;border-bottom:1px solid rgba(241,236,223,0.12)">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="left" style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:400;font-size:17px;color:#d4b884">Château Privé</td>
<td align="right" style="font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase">15 May 2026</td>
</tr>
</table>
</td></tr>

<!-- Headline (compact, no checkmark, above-the-fold has the news) -->
<tr><td class="px-40 py-top" align="left" style="padding:40px 40px 28px">

<p style="margin:0 0 10px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase">Cannes &middot; 15 May 2026</p>

<h1 class="h1" style="margin:0 0 0;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:300;font-size:36px;line-height:1.1;color:#d4b884;letter-spacing:-0.3px">You are confirmed.</h1>

</td></tr>

<!-- Body copy (short) -->
<tr><td class="px-40" align="left" style="padding:0 40px 28px">
<p style="margin:0 0 14px;font-family:'EB Garamond',Georgia,serif;font-size:16px;line-height:1.6;color:#F1ECDF">Dear ${escapeHtml(firstName)},</p>
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:16px;line-height:1.6;color:rgba(241,236,223,0.85)">
Your attendance at <span style="color:#F1ECDF">Château Privé</span> is confirmed — a private evening during the 79<sup style="font-size:10px">th</sup> Cannes Film Festival.
</p>
</td></tr>

<!-- Details -->
<tr><td class="px-40" style="padding:0 40px">
<table role="presentation" class="details" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#231D17;border-top:1px solid rgba(241,236,223,0.12);border-bottom:1px solid rgba(241,236,223,0.12)">
<tr>
<td class="lbl" width="120" style="padding:16px 0 16px 24px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Date</td>
<td class="val" style="padding:16px 24px 16px 0;font-family:'EB Garamond',Georgia,serif;font-size:15px;color:#F1ECDF;line-height:1.5">Friday, 15 May 2026</td>
</tr>
<tr><td colspan="2" style="border-top:1px solid rgba(241,236,223,0.08);line-height:0;font-size:0">&nbsp;</td></tr>
<tr>
<td class="lbl" style="padding:16px 0 16px 24px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Place</td>
<td class="val" style="padding:16px 24px 16px 0;font-family:'EB Garamond',Georgia,serif;font-size:15px;color:#F1ECDF;line-height:1.5">Cannes Californie</td>
</tr>
<tr><td colspan="2" style="border-top:1px solid rgba(241,236,223,0.08);line-height:0;font-size:0">&nbsp;</td></tr>
<tr>
<td class="lbl" style="padding:16px 0 16px 24px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Doors</td>
<td class="val" style="padding:16px 24px 16px 0;font-family:'EB Garamond',Georgia,serif;font-size:15px;color:#F1ECDF;line-height:1.5"><strong style="color:#d4b884">17:00</strong> &mdash; please be early</td>
</tr>
</table>
</td></tr>

<!-- Address note -->
<tr><td class="px-40" align="center" style="padding:18px 40px 0">
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:12px;line-height:1.6;color:rgba(241,236,223,0.55);font-style:italic">The exact address will be shared 24 hours before the event by SMS.</p>
</td></tr>

<!-- Plus-One CTA (with shareable hint) -->
<tr><td class="px-40" style="padding:28px 40px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#231D17;border:1px solid rgba(184,150,90,0.25)">
<tr><td align="center" style="padding:24px">
<p style="margin:0 0 6px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:#d4b884;letter-spacing:3px;text-transform:uppercase">Bring someone</p>
<p style="margin:0 0 8px;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:18px;color:#F1ECDF;line-height:1.3">Add a guest, or share the link.</p>
<p style="margin:0 0 16px;font-family:'EB Garamond',Georgia,serif;font-size:13px;color:rgba(241,236,223,0.6);line-height:1.5">Send this link to the person you'd like to bring &mdash; they can fill in their details directly.</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr><td bgcolor="#B8965A" style="background-color:#B8965A;border-radius:2px">
<a href="${escapeHtml(plusOneUrl)}" style="display:inline-block;padding:12px 26px;font-family:'EB Garamond',Georgia,serif;font-size:11px;color:#0F0C09;text-decoration:none;letter-spacing:3px;text-transform:uppercase;font-weight:500">Open plus-one page</a>
</td></tr>
</table>
</td></tr>
</table>
</td></tr>

<!-- Decline -->
<tr><td class="px-40" align="center" style="padding:24px 40px 36px">
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:12px;color:rgba(241,236,223,0.55)">
Can't attend? <a href="${escapeHtml(declineUrl)}" style="color:#d4b884;text-decoration:underline">Let us know</a>
</p>
</td></tr>

<!-- Footer -->
<tr><td align="center" class="px-40" style="padding:24px 40px 32px;border-top:1px solid rgba(241,236,223,0.12);background-color:#0F0C09">
<p style="margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:400;font-size:16px;color:#d4b884">Château Privé</p>
</td></tr>

</table>

</td></tr>
</table>
</body></html>`;

  return { subject, text, html };
}

// ============== WAITLIST EMAIL ==============

export function renderWaitlistEmail({ name, declineCode }) {
  const firstName = (name || '').split(' ')[0] || 'there';
  const subject = "You're on the waitlist — Château Privé · 15 May 2026";
  const declineUrl = shortUrl(declineCode);

  const text = `Dear ${firstName},

We've placed you on the waitlist for Château Privé — Friday, 15 May 2026 in Cannes Californie.

We'll be in touch in the coming days as we finalize the guest list. If a spot opens up, you'll hear from us first.

No action needed from your side at this point.

Can no longer attend?
${declineUrl}

— Château Privé
`;

  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${escapeHtml(subject)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=EB+Garamond:wght@400;500&display=swap" rel="stylesheet">
<style>
@media only screen and (max-width: 620px) {
  .container { width: 100% !important; }
  .px-48 { padding-left: 28px !important; padding-right: 28px !important; }
  .py-72 { padding-top: 48px !important; padding-bottom: 40px !important; }
  .h1 { font-size: 50px !important; }
}
body { margin: 0; padding: 0; }
</style>
</head>
<body style="margin:0;padding:0;background-color:#0F0C09;font-family:'EB Garamond',Georgia,serif;color:#F1ECDF">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#0F0C09">You're on the waitlist for Château Privé · 15 May 2026.</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0F0C09" style="background-color:#0F0C09">
<tr><td align="center" style="padding:40px 16px">

<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#1A1612">

<tr><td align="center" class="px-48" style="padding:24px 48px;border-bottom:1px solid rgba(241,236,223,0.12)">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="left" style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:400;font-size:18px;color:#d4b884">Château Privé</td>
<td align="right" style="font-family:'EB Garamond',Georgia,serif;font-size:11px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase">Cannes &middot; MMXXVI</td>
</tr>
</table>
</td></tr>

<tr><td class="px-48 py-72" align="center" style="padding:64px 48px 32px">

<p style="margin:0 0 22px;font-family:'EB Garamond',Georgia,serif;font-size:11px;color:rgba(241,236,223,0.65);letter-spacing:4px;text-transform:uppercase">Waitlisted</p>

<h1 class="h1" style="margin:0 0 24px;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:300;font-size:56px;line-height:1.05;color:#d4b884;letter-spacing:-0.5px">You're on the<br>waitlist.</h1>

<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 32px">
<tr><td width="60" height="1" bgcolor="#B8965A" style="background-color:#B8965A;line-height:1px;font-size:0">&nbsp;</td></tr>
</table>

<p style="margin:0 0 20px;font-family:'EB Garamond',Georgia,serif;font-size:17px;line-height:1.65;color:#F1ECDF;text-align:left">Dear ${escapeHtml(firstName)},</p>
<p style="margin:0 0 18px;font-family:'EB Garamond',Georgia,serif;font-size:17px;line-height:1.65;color:rgba(241,236,223,0.78);text-align:left">
We've placed you on the waitlist for <span style="color:#F1ECDF">Château Privé</span>, a private evening during the 79<sup style="font-size:11px">th</sup> Cannes Film Festival on <span style="color:#F1ECDF">Friday, 15 May 2026</span>.
</p>
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:17px;line-height:1.65;color:rgba(241,236,223,0.78);text-align:left">
We'll be in touch in the coming days as we finalize the guest list. If a spot opens up, you'll hear from us first.
</p>

</td></tr>

<tr><td class="px-48" style="padding:0 48px 8px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#231D17;border-top:1px solid rgba(241,236,223,0.12);border-bottom:1px solid rgba(241,236,223,0.12)">
<tr>
<td width="140" style="padding:18px 0 18px 28px;font-family:'EB Garamond',Georgia,serif;font-size:11px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Date</td>
<td style="padding:18px 28px 18px 0;font-family:'EB Garamond',Georgia,serif;font-size:16px;color:#F1ECDF;line-height:1.5">Friday, 15 May 2026</td>
</tr>
<tr><td colspan="2" style="border-top:1px solid rgba(241,236,223,0.08);line-height:0;font-size:0">&nbsp;</td></tr>
<tr>
<td style="padding:18px 0 18px 28px;font-family:'EB Garamond',Georgia,serif;font-size:11px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Place</td>
<td style="padding:18px 28px 18px 0;font-family:'EB Garamond',Georgia,serif;font-size:16px;color:#F1ECDF;line-height:1.5">Cannes Californie</td>
</tr>
</table>
</td></tr>

<tr><td class="px-48" align="center" style="padding:32px 48px">
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:14px;line-height:1.6;color:rgba(241,236,223,0.6);font-style:italic">No action needed from your side at this point.</p>
</td></tr>

<tr><td class="px-48" align="center" style="padding:0 48px 48px">
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:12px;color:rgba(241,236,223,0.55)">
Can no longer attend?
<a href="${escapeHtml(declineUrl)}" style="color:#d4b884;text-decoration:underline">Let us know</a>
</p>
</td></tr>

<tr><td align="center" class="px-48" style="padding:32px 48px 40px;border-top:1px solid rgba(241,236,223,0.12);background-color:#0F0C09">
<p style="margin:0 0 8px;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:400;font-size:18px;color:#d4b884">Château Privé</p>
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.45);letter-spacing:3px;text-transform:uppercase;line-height:1.8">Cannes &middot; 15 May 2026 &middot; Privately Hosted</p>
</td></tr>

</table>

</td></tr>
</table>
</body></html>`;

  return { subject, text, html };
}

// ============== PLUS-ONE WELCOME EMAIL ==============

export function renderPlusOneWelcomeEmail({ name, primaryName, declineCode }) {
  const firstName = (name || '').split(' ')[0] || 'there';
  const subject = "You are confirmed — Château Privé · 15 May 2026";
  const declineUrl = shortUrl(declineCode);

  const text = `Dear ${firstName},

${primaryName} added you as their guest at Château Privé.

Friday, 15 May 2026 · Cannes Californie
Doors at 17:00 — please be early.

The exact address will be shared 24 hours before the event by SMS.

Can't attend? ${declineUrl}

— Château Privé
`;

  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${escapeHtml(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=EB+Garamond:wght@400;500&display=swap" rel="stylesheet">
<style>
@media only screen and (max-width: 620px) {
  .container { width: 100% !important; }
  .px-40 { padding-left: 24px !important; padding-right: 24px !important; }
  .h1 { font-size: 30px !important; line-height: 1.15 !important; }
  .details td { font-size: 14px !important; }
  .details .lbl { width: 90px !important; padding-left: 20px !important; }
  .details .val { padding-right: 20px !important; }
  .py-top { padding-top: 36px !important; padding-bottom: 28px !important; }
}
body { margin: 0; padding: 0; }
</style>
</head>
<body style="margin:0;padding:0;background-color:#0F0C09;font-family:'EB Garamond',Georgia,serif;color:#F1ECDF">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0F0C09" style="background-color:#0F0C09">
<tr><td align="center" style="padding:32px 16px">

<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background-color:#1A1612">

<!-- Header -->
<tr><td align="center" class="px-40" style="padding:20px 40px;border-bottom:1px solid rgba(241,236,223,0.12)">
<table role="presentation" width="100%">
<tr>
<td align="left" style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:17px;color:#d4b884">Château Privé</td>
<td align="right" style="font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase">15 May 2026</td>
</tr>
</table>
</td></tr>

<!-- Headline -->
<tr><td class="px-40 py-top" align="left" style="padding:40px 40px 28px">
<p style="margin:0 0 10px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase">Cannes &middot; 15 May 2026</p>
<h1 class="h1" style="margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:300;font-size:36px;line-height:1.1;color:#d4b884;letter-spacing:-0.3px">You are confirmed.</h1>
</td></tr>

<!-- Body -->
<tr><td class="px-40" align="left" style="padding:0 40px 28px">
<p style="margin:0 0 14px;font-family:'EB Garamond',Georgia,serif;font-size:16px;line-height:1.6;color:#F1ECDF">Dear ${escapeHtml(firstName)},</p>
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:16px;line-height:1.6;color:rgba(241,236,223,0.85)">
<span style="color:#F1ECDF">${escapeHtml(primaryName)}</span> added you as their guest at <span style="color:#F1ECDF">Château Privé</span> &mdash; a private evening during the 79<sup style="font-size:10px">th</sup> Cannes Film Festival.
</p>
</td></tr>

<!-- Details -->
<tr><td class="px-40" style="padding:0 40px">
<table role="presentation" class="details" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#231D17;border-top:1px solid rgba(241,236,223,0.12);border-bottom:1px solid rgba(241,236,223,0.12)">
<tr>
<td class="lbl" width="120" style="padding:16px 0 16px 24px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Date</td>
<td class="val" style="padding:16px 24px 16px 0;font-family:'EB Garamond',Georgia,serif;font-size:15px;color:#F1ECDF;line-height:1.5">Friday, 15 May 2026</td>
</tr>
<tr><td colspan="2" style="border-top:1px solid rgba(241,236,223,0.08);line-height:0;font-size:0">&nbsp;</td></tr>
<tr>
<td class="lbl" style="padding:16px 0 16px 24px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Place</td>
<td class="val" style="padding:16px 24px 16px 0;font-family:'EB Garamond',Georgia,serif;font-size:15px;color:#F1ECDF;line-height:1.5">Cannes Californie</td>
</tr>
<tr><td colspan="2" style="border-top:1px solid rgba(241,236,223,0.08);line-height:0;font-size:0">&nbsp;</td></tr>
<tr>
<td class="lbl" style="padding:16px 0 16px 24px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Doors</td>
<td class="val" style="padding:16px 24px 16px 0;font-family:'EB Garamond',Georgia,serif;font-size:15px;color:#F1ECDF;line-height:1.5"><strong style="color:#d4b884">17:00</strong> &mdash; please be early</td>
</tr>
</table>
</td></tr>

<!-- Address note -->
<tr><td class="px-40" align="center" style="padding:18px 40px 0">
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:12px;line-height:1.6;color:rgba(241,236,223,0.55);font-style:italic">The exact address will be shared 24 hours before the event by SMS.</p>
</td></tr>

<!-- Decline -->
<tr><td class="px-40" align="center" style="padding:24px 40px 36px">
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:12px;color:rgba(241,236,223,0.55)">
Can't attend? <a href="${escapeHtml(declineUrl)}" style="color:#d4b884;text-decoration:underline">Let us know</a>
</p>
</td></tr>

<tr><td align="center" class="px-40" style="padding:24px 40px 32px;border-top:1px solid rgba(241,236,223,0.12);background-color:#0F0C09">
<p style="margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:16px;color:#d4b884">Château Privé</p>
</td></tr>

</table>

</td></tr>
</table>
</body></html>`;

  return { subject, text, html };
}

// ============== SMS TEMPLATES (short URLs!) ==============

export function renderConfirmationSms({ name, declineCode }) {
  const firstName = (name || '').split(' ')[0] || '';
  return `${firstName ? firstName + ', ' : ''}you're confirmed for Château Privé · 15 May · Cannes. Details in your email. Can't make it? ${shortUrl(declineCode)}`;
}

export function renderWaitlistSms({ name, declineCode }) {
  const firstName = (name || '').split(' ')[0] || '';
  return `${firstName ? firstName + ', ' : ''}you're on the waitlist for Château Privé · 15 May · Cannes. Details in your email. Can't make it? ${shortUrl(declineCode)}`;
}

export function renderPlusOneWelcomeSms({ name, primaryName, declineCode }) {
  const firstName = (name || '').split(' ')[0] || '';
  return `${firstName ? firstName + ', ' : ''}${primaryName} added you to Château Privé · 15 May · Cannes. Details in your email. Can't make it? ${shortUrl(declineCode)}`;
}

// ============== EVENT UPDATE EMAIL ==============
// Sent when event date or details change. Does NOT reveal address.
export function renderEventUpdateEmail({ name, declineCode }) {
  const firstName = (name || '').split(' ')[0] || 'there';
  const subject = `Important update — Château Privé · ${EVENT.dateShort}`;
  const declineUrl = shortUrl(declineCode);

  const text = `Dear ${firstName},

An important update regarding your invitation to Château Privé.

Date: ${EVENT.dateFull}
Doors: ${EVENT.doorsLabel}
Place: ${EVENT.city}

The exact address will be shared 24 hours before the event by SMS.

All other details remain the same. Your invitation is still confirmed.

If you can no longer attend with these details:
${declineUrl}

— Château Privé
`;

  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${escapeHtml(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=EB+Garamond:wght@400;500&display=swap" rel="stylesheet">
<style>
@media only screen and (max-width: 620px) {
  .container { width: 100% !important; }
  .px-40 { padding-left: 24px !important; padding-right: 24px !important; }
  .h1 { font-size: 30px !important; line-height: 1.15 !important; }
  .details td { font-size: 14px !important; }
  .details .lbl { width: 90px !important; padding-left: 20px !important; }
  .details .val { padding-right: 20px !important; }
}
body { margin: 0; padding: 0; }
</style>
</head>
<body style="margin:0;padding:0;background-color:#0F0C09;font-family:'EB Garamond',Georgia,serif;color:#F1ECDF">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0F0C09" style="background-color:#0F0C09">
<tr><td align="center" style="padding:32px 16px">

<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background-color:#1A1612">

<tr><td align="center" class="px-40" style="padding:20px 40px;border-bottom:1px solid rgba(241,236,223,0.12)">
<table role="presentation" width="100%"><tr>
<td align="left" style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:17px;color:#d4b884">Château Privé</td>
<td align="right" style="font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase">${escapeHtml(EVENT.dateShort)}</td>
</tr></table>
</td></tr>

<tr><td class="px-40" align="left" style="padding:40px 40px 28px">
<p style="margin:0 0 10px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:#d4b884;letter-spacing:3px;text-transform:uppercase">Important update</p>
<h1 class="h1" style="margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:300;font-size:36px;line-height:1.1;color:#d4b884;letter-spacing:-0.3px">A change to your invitation.</h1>
</td></tr>

<tr><td class="px-40" align="left" style="padding:0 40px 28px">
<p style="margin:0 0 14px;font-family:'EB Garamond',Georgia,serif;font-size:16px;line-height:1.6;color:#F1ECDF">Dear ${escapeHtml(firstName)},</p>
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:16px;line-height:1.6;color:rgba(241,236,223,0.85)">
We've made an important update to <span style="color:#F1ECDF">Château Privé</span>. Your invitation is still confirmed — please review the latest details below.
</p>
</td></tr>

<tr><td class="px-40" style="padding:0 40px">
<table role="presentation" class="details" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#231D17;border-top:1px solid rgba(241,236,223,0.12);border-bottom:1px solid rgba(241,236,223,0.12)">
<tr>
<td class="lbl" width="120" style="padding:16px 0 16px 24px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Date</td>
<td class="val" style="padding:16px 24px 16px 0;font-family:'EB Garamond',Georgia,serif;font-size:15px;color:#F1ECDF;line-height:1.5">${escapeHtml(EVENT.dateFull)}</td>
</tr>
<tr><td colspan="2" style="border-top:1px solid rgba(241,236,223,0.08);line-height:0;font-size:0">&nbsp;</td></tr>
<tr>
<td class="lbl" style="padding:16px 0 16px 24px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Place</td>
<td class="val" style="padding:16px 24px 16px 0;font-family:'EB Garamond',Georgia,serif;font-size:15px;color:#F1ECDF;line-height:1.5">${escapeHtml(EVENT.city)}</td>
</tr>
<tr><td colspan="2" style="border-top:1px solid rgba(241,236,223,0.08);line-height:0;font-size:0">&nbsp;</td></tr>
<tr>
<td class="lbl" style="padding:16px 0 16px 24px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Doors</td>
<td class="val" style="padding:16px 24px 16px 0;font-family:'EB Garamond',Georgia,serif;font-size:15px;color:#F1ECDF;line-height:1.5"><strong style="color:#d4b884">${escapeHtml(EVENT.doors)}</strong> &mdash; please be early</td>
</tr>
</table>
</td></tr>

<tr><td class="px-40" align="center" style="padding:18px 40px 0">
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:12px;line-height:1.6;color:rgba(241,236,223,0.55);font-style:italic">The exact address will be shared 24 hours before the event by SMS.</p>
</td></tr>

<tr><td class="px-40" align="center" style="padding:24px 40px 36px">
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:12px;color:rgba(241,236,223,0.55)">
Can no longer attend? <a href="${escapeHtml(declineUrl)}" style="color:#d4b884;text-decoration:underline">Let us know</a>
</p>
</td></tr>

<tr><td align="center" class="px-40" style="padding:24px 40px 32px;border-top:1px solid rgba(241,236,223,0.12);background-color:#0F0C09">
<p style="margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:16px;color:#d4b884">Château Privé</p>
</td></tr>

</table>
</td></tr>
</table>
</body></html>`;

  return { subject, text, html };
}

export function renderEventUpdateSms({ name, declineCode }) {
  const firstName = (name || '').split(' ')[0] || '';
  return `${firstName ? firstName + ', ' : ''}update for Château Privé · ${EVENT.dateSms} · doors ${EVENT.doors}. Check email. Can't attend? ${shortUrl(declineCode)}`;
}

// ============== 24H REMINDER EMAIL ==============
// Sent ~24h before event. REVEALS THE ADDRESS. Contains QR placeholder.
export function render24hReminderEmail({ name, declineCode, qrCodeImageUrl }) {
  const firstName = (name || '').split(' ')[0] || 'there';
  const subject = `Tomorrow — Château Privé · ${EVENT.dateShort}`;
  const declineUrl = shortUrl(declineCode);

  // QR placeholder — empty by default, fills when door-check-in system is ready
  const qrBlock = qrCodeImageUrl
    ? `<tr><td class="px-40" align="center" style="padding:32px 40px 0">
<p style="margin:0 0 12px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:#d4b884;letter-spacing:3px;text-transform:uppercase">Your entry pass</p>
<img src="${escapeHtml(qrCodeImageUrl)}" alt="Entry QR" width="200" height="200" style="display:block;margin:0 auto;background:#F1ECDF;padding:12px">
<p style="margin:14px 0 0;font-family:'EB Garamond',Georgia,serif;font-size:12px;color:rgba(241,236,223,0.6)">Show this at the door.</p>
</td></tr>`
    : '';

  const text = `Dear ${firstName},

A reminder for tomorrow.

DATE: ${EVENT.dateFull}
DOORS: ${EVENT.doorsLabel}
ADDRESS: ${EVENT.address}
Map: ${EVENT.addressMapsUrl}

For verification at the door, please bring:
- A government-issued ID
- Have your Instagram handle ready

If you can no longer attend:
${declineUrl}

See you tomorrow.

— Château Privé
`;

  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<title>${escapeHtml(subject)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=EB+Garamond:wght@400;500&display=swap" rel="stylesheet">
<style>
@media only screen and (max-width: 620px) {
  .container { width: 100% !important; }
  .px-40 { padding-left: 24px !important; padding-right: 24px !important; }
  .h1 { font-size: 30px !important; line-height: 1.15 !important; }
  .details td { font-size: 14px !important; }
  .details .lbl { width: 90px !important; padding-left: 20px !important; }
  .details .val { padding-right: 20px !important; }
}
body { margin: 0; padding: 0; }
</style>
</head>
<body style="margin:0;padding:0;background-color:#0F0C09;font-family:'EB Garamond',Georgia,serif;color:#F1ECDF">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0F0C09" style="background-color:#0F0C09">
<tr><td align="center" style="padding:32px 16px">

<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background-color:#1A1612">

<tr><td align="center" class="px-40" style="padding:20px 40px;border-bottom:1px solid rgba(241,236,223,0.12)">
<table role="presentation" width="100%"><tr>
<td align="left" style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:17px;color:#d4b884">Château Privé</td>
<td align="right" style="font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase">${escapeHtml(EVENT.dateShort)}</td>
</tr></table>
</td></tr>

<tr><td class="px-40" align="left" style="padding:40px 40px 28px">
<p style="margin:0 0 10px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:#d4b884;letter-spacing:3px;text-transform:uppercase">Tomorrow</p>
<h1 class="h1" style="margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:300;font-size:36px;line-height:1.1;color:#d4b884;letter-spacing:-0.3px">See you tomorrow.</h1>
</td></tr>

<tr><td class="px-40" align="left" style="padding:0 40px 28px">
<p style="margin:0 0 14px;font-family:'EB Garamond',Georgia,serif;font-size:16px;line-height:1.6;color:#F1ECDF">Dear ${escapeHtml(firstName)},</p>
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:16px;line-height:1.6;color:rgba(241,236,223,0.85)">
A quick reminder for <span style="color:#F1ECDF">Château Privé</span> tomorrow, with the full address.
</p>
</td></tr>

<tr><td class="px-40" style="padding:0 40px">
<table role="presentation" class="details" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#231D17;border-top:1px solid rgba(241,236,223,0.12);border-bottom:1px solid rgba(241,236,223,0.12)">
<tr>
<td class="lbl" width="120" style="padding:16px 0 16px 24px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Date</td>
<td class="val" style="padding:16px 24px 16px 0;font-family:'EB Garamond',Georgia,serif;font-size:15px;color:#F1ECDF;line-height:1.5">${escapeHtml(EVENT.dateFull)}</td>
</tr>
<tr><td colspan="2" style="border-top:1px solid rgba(241,236,223,0.08);line-height:0;font-size:0">&nbsp;</td></tr>
<tr>
<td class="lbl" style="padding:16px 0 16px 24px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Doors</td>
<td class="val" style="padding:16px 24px 16px 0;font-family:'EB Garamond',Georgia,serif;font-size:15px;color:#F1ECDF;line-height:1.5"><strong style="color:#d4b884">${escapeHtml(EVENT.doors)}</strong> &mdash; please be early</td>
</tr>
<tr><td colspan="2" style="border-top:1px solid rgba(241,236,223,0.08);line-height:0;font-size:0">&nbsp;</td></tr>
<tr>
<td class="lbl" style="padding:16px 0 16px 24px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Address</td>
<td class="val" style="padding:16px 24px 16px 0;font-family:'EB Garamond',Georgia,serif;font-size:15px;color:#F1ECDF;line-height:1.5">
${escapeHtml(EVENT.address)}<br>
<a href="${escapeHtml(EVENT.addressMapsUrl)}" style="color:#d4b884;text-decoration:underline;font-size:13px">Open in Google Maps</a>
</td>
</tr>
</table>
</td></tr>

${qrBlock}

<tr><td class="px-40" align="left" style="padding:32px 40px 0">
<p style="margin:0 0 10px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:#d4b884;letter-spacing:3px;text-transform:uppercase">At the door</p>
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:14px;line-height:1.65;color:rgba(241,236,223,0.85)">
For verification, please bring:<br>
&middot; A government-issued ID<br>
&middot; Have your Instagram handle ready
</p>
</td></tr>

<tr><td class="px-40" align="center" style="padding:32px 40px 36px">
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:12px;color:rgba(241,236,223,0.55)">
Can no longer attend? <a href="${escapeHtml(declineUrl)}" style="color:#d4b884;text-decoration:underline">Let us know</a>
</p>
</td></tr>

<tr><td align="center" class="px-40" style="padding:24px 40px 32px;border-top:1px solid rgba(241,236,223,0.12);background-color:#0F0C09">
<p style="margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:16px;color:#d4b884">Château Privé</p>
</td></tr>

</table>
</td></tr>
</table>
</body></html>`;

  return { subject, text, html };
}

export function render24hReminderSms({ name, declineCode }) {
  const firstName = (name || '').split(' ')[0] || '';
  // SMS reveals the address in the 24h reminder
  return `${firstName ? firstName + ', ' : ''}tomorrow at Château Privé · ${EVENT.address} · doors ${EVENT.doors}. Bring ID + IG handle. Can't attend? ${shortUrl(declineCode)}`;
}
