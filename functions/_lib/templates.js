// deploy-marker 1778406072
// Email + SMS templates for messaging flows.
// Dark Château Privé style — matches cannescastle email design.
//
// All URLs use the short-code domain: chateau-cannes.fraimit.com/r/{code}

import { escapeHtml } from './messaging-utils.js';

// Base URL where the public decline / plus-one pages live (cannescastle project)
const PUBLIC_BASE = 'https://chateau-cannes.fraimit.com';

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

It is our pleasure to confirm your attendance at Château Privé, a private evening hosted during the 79th Cannes Film Festival.

Date: Friday, 15 May 2026
Place: A private château · Cannes Californie
Doors: 16:00 (Setters wave) · 17:00 (Main wave) · 18:00 hard close

The exact address will be sent 48 hours before the event by SMS.

Bring one person — add a guest:
${plusOneUrl}

Can't attend after all?
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
  .h1 { font-size: 56px !important; }
  .details td { font-size: 14px !important; }
  .details .lbl { width: 110px !important; }
}
body { margin: 0; padding: 0; }
</style>
</head>
<body style="margin:0;padding:0;background-color:#0F0C09;font-family:'EB Garamond',Georgia,serif;color:#F1ECDF">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#0F0C09">Your attendance is confirmed. Friday, 15 May 2026.</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0F0C09" style="background-color:#0F0C09">
<tr><td align="center" style="padding:40px 16px">

<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#1A1612">

<!-- Header -->
<tr><td align="center" class="px-48" style="padding:24px 48px;border-bottom:1px solid rgba(241,236,223,0.12)">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr>
<td align="left" style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:400;font-size:18px;color:#d4b884">Château Privé</td>
<td align="right" style="font-family:'EB Garamond',Georgia,serif;font-size:11px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase">Cannes &middot; MMXXVI</td>
</tr>
</table>
</td></tr>

<!-- Body -->
<tr><td class="px-48 py-72" align="center" style="padding:64px 48px 32px">

<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 28px">
<tr><td width="72" height="72" align="center" valign="middle" style="border:1px solid #B8965A;border-radius:36px;font-family:Georgia,serif;font-size:28px;color:#d4b884;line-height:72px">&#10003;</td></tr>
</table>

<p style="margin:0 0 22px;font-family:'EB Garamond',Georgia,serif;font-size:11px;color:rgba(241,236,223,0.65);letter-spacing:4px;text-transform:uppercase">You are confirmed</p>

<h1 class="h1" style="margin:0 0 24px;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:300;font-size:64px;line-height:1;color:#d4b884;letter-spacing:-0.5px">Welcome.</h1>

<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 32px">
<tr><td width="60" height="1" bgcolor="#B8965A" style="background-color:#B8965A;line-height:1px;font-size:0">&nbsp;</td></tr>
</table>

<p style="margin:0 0 20px;font-family:'EB Garamond',Georgia,serif;font-size:17px;line-height:1.65;color:#F1ECDF;text-align:left">Dear ${escapeHtml(firstName)},</p>
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:17px;line-height:1.65;color:rgba(241,236,223,0.78);text-align:left">
It is our pleasure to confirm your attendance at <span style="color:#F1ECDF">Château Privé</span>, a private evening hosted during the 79<sup style="font-size:11px">th</sup> Cannes Film Festival.
</p>

</td></tr>

<!-- Details -->
<tr><td class="px-48" style="padding:0 48px 8px">
<table role="presentation" class="details" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#231D17;border-top:1px solid rgba(241,236,223,0.12);border-bottom:1px solid rgba(241,236,223,0.12)">
<tr>
<td class="lbl" width="140" style="padding:18px 0 18px 28px;font-family:'EB Garamond',Georgia,serif;font-size:11px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Date</td>
<td style="padding:18px 28px 18px 0;font-family:'EB Garamond',Georgia,serif;font-size:16px;color:#F1ECDF;line-height:1.5">Friday, 15 May 2026</td>
</tr>
<tr><td colspan="2" style="border-top:1px solid rgba(241,236,223,0.08);line-height:0;font-size:0">&nbsp;</td></tr>
<tr>
<td class="lbl" style="padding:18px 0 18px 28px;font-family:'EB Garamond',Georgia,serif;font-size:11px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Place</td>
<td style="padding:18px 28px 18px 0;font-family:'EB Garamond',Georgia,serif;font-size:16px;color:#F1ECDF;line-height:1.5">A private château<br><span style="color:rgba(241,236,223,0.6);font-size:14px">Cannes Californie</span></td>
</tr>
<tr><td colspan="2" style="border-top:1px solid rgba(241,236,223,0.08);line-height:0;font-size:0">&nbsp;</td></tr>
<tr>
<td class="lbl" style="padding:18px 0 18px 28px;font-family:'EB Garamond',Georgia,serif;font-size:11px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Doors</td>
<td style="padding:18px 28px 18px 0;font-family:'EB Garamond',Georgia,serif;font-size:15px;color:#F1ECDF;line-height:1.7">
<strong style="color:#d4b884">16:00</strong> Setters wave<br>
<strong style="color:#d4b884">17:00</strong> Main wave<br>
<strong style="color:#d4b884">18:00</strong> Hard close
</td>
</tr>
</table>
</td></tr>

<!-- Address note -->
<tr><td class="px-48" align="center" style="padding:24px 48px 0">
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:13px;line-height:1.6;color:rgba(241,236,223,0.6);font-style:italic">The exact address will be sent 48 hours before the event by SMS.</p>
</td></tr>

<!-- Plus-One CTA -->
<tr><td class="px-48" style="padding:32px 48px 0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#231D17;border:1px solid rgba(184,150,90,0.25)">
<tr><td align="center" style="padding:28px 28px">
<p style="margin:0 0 8px;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:#d4b884;letter-spacing:4px;text-transform:uppercase">Bring someone</p>
<p style="margin:0 0 18px;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:22px;color:#F1ECDF;line-height:1.3">Add one person to your invitation.</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr><td bgcolor="#B8965A" style="background-color:#B8965A;border-radius:2px">
<a href="${escapeHtml(plusOneUrl)}" style="display:inline-block;padding:13px 28px;font-family:'EB Garamond',Georgia,serif;font-size:11px;color:#0F0C09;text-decoration:none;letter-spacing:3px;text-transform:uppercase;font-weight:500">Add a person</a>
</td></tr>
</table>
<p style="margin:14px 0 0;font-family:'EB Garamond',Georgia,serif;font-size:11px;color:rgba(241,236,223,0.5)">One person maximum.</p>
</td></tr>
</table>
</td></tr>

<!-- Decline -->
<tr><td class="px-48" align="center" style="padding:32px 48px 48px">
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:12px;color:rgba(241,236,223,0.55)">
Can't attend after all?
<a href="${escapeHtml(declineUrl)}" style="color:#d4b884;text-decoration:underline">Let us know</a>
</p>
</td></tr>

<!-- Footer -->
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

${primaryName} added you as their guest for Château Privé.

Date: Friday, 15 May 2026
Place: A private château · Cannes Californie
Doors: 16:00 (Setters) · 17:00 (Main) · 18:00 hard close

The exact address will be sent 48 hours before the event by SMS.

Can't attend?
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
  .px-48 { padding-left: 28px !important; padding-right: 28px !important; }
  .h1 { font-size: 56px !important; }
}
body { margin: 0; padding: 0; }
</style>
</head>
<body style="margin:0;padding:0;background-color:#0F0C09;font-family:'EB Garamond',Georgia,serif;color:#F1ECDF">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0F0C09" style="background-color:#0F0C09">
<tr><td align="center" style="padding:40px 16px">

<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background-color:#1A1612">

<tr><td align="center" class="px-48" style="padding:24px 48px;border-bottom:1px solid rgba(241,236,223,0.12)">
<table role="presentation" width="100%">
<tr>
<td align="left" style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:18px;color:#d4b884">Château Privé</td>
<td align="right" style="font-family:'EB Garamond',Georgia,serif;font-size:11px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase">Cannes &middot; MMXXVI</td>
</tr>
</table>
</td></tr>

<tr><td class="px-48" align="center" style="padding:64px 48px 32px">

<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 28px">
<tr><td width="72" height="72" align="center" valign="middle" style="border:1px solid #B8965A;border-radius:36px;font-family:Georgia,serif;font-size:28px;color:#d4b884;line-height:72px">&#10003;</td></tr>
</table>

<p style="margin:0 0 22px;font-family:'EB Garamond',Georgia,serif;font-size:11px;color:rgba(241,236,223,0.65);letter-spacing:4px;text-transform:uppercase">You are confirmed</p>

<h1 class="h1" style="margin:0 0 24px;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:300;font-size:64px;line-height:1;color:#d4b884">Welcome.</h1>

<table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 32px">
<tr><td width="60" height="1" bgcolor="#B8965A" style="background-color:#B8965A;line-height:1px;font-size:0">&nbsp;</td></tr>
</table>

<p style="margin:0 0 20px;font-family:'EB Garamond',Georgia,serif;font-size:17px;line-height:1.65;color:#F1ECDF;text-align:left">Dear ${escapeHtml(firstName)},</p>
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:17px;line-height:1.65;color:rgba(241,236,223,0.78);text-align:left">
<span style="color:#F1ECDF">${escapeHtml(primaryName)}</span> has added you as their guest for <span style="color:#F1ECDF">Château Privé</span>, a private evening during the 79<sup style="font-size:11px">th</sup> Cannes Film Festival.
</p>

</td></tr>

<tr><td class="px-48" style="padding:0 48px 8px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#231D17;border-top:1px solid rgba(241,236,223,0.12);border-bottom:1px solid rgba(241,236,223,0.12)">
<tr>
<td width="140" style="padding:18px 0 18px 28px;font-family:'EB Garamond',Georgia,serif;font-size:11px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Date</td>
<td style="padding:18px 28px 18px 0;font-family:'EB Garamond',Georgia,serif;font-size:16px;color:#F1ECDF;line-height:1.5">Friday, 15 May 2026</td>
</tr>
<tr><td colspan="2" style="border-top:1px solid rgba(241,236,223,0.08);line-height:0;font-size:0">&nbsp;</td></tr>
<tr>
<td style="padding:18px 0 18px 28px;font-family:'EB Garamond',Georgia,serif;font-size:11px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Place</td>
<td style="padding:18px 28px 18px 0;font-family:'EB Garamond',Georgia,serif;font-size:16px;color:#F1ECDF;line-height:1.5">A private château<br><span style="color:rgba(241,236,223,0.6);font-size:14px">Cannes Californie</span></td>
</tr>
<tr><td colspan="2" style="border-top:1px solid rgba(241,236,223,0.08);line-height:0;font-size:0">&nbsp;</td></tr>
<tr>
<td style="padding:18px 0 18px 28px;font-family:'EB Garamond',Georgia,serif;font-size:11px;color:rgba(241,236,223,0.55);letter-spacing:3px;text-transform:uppercase;vertical-align:top">Doors</td>
<td style="padding:18px 28px 18px 0;font-family:'EB Garamond',Georgia,serif;font-size:15px;color:#F1ECDF;line-height:1.7">
<strong style="color:#d4b884">16:00</strong> Setters wave<br>
<strong style="color:#d4b884">17:00</strong> Main wave<br>
<strong style="color:#d4b884">18:00</strong> Hard close
</td>
</tr>
</table>
</td></tr>

<tr><td class="px-48" align="center" style="padding:24px 48px 0">
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:13px;line-height:1.6;color:rgba(241,236,223,0.6);font-style:italic">The exact address will be sent 48 hours before the event by SMS.</p>
</td></tr>

<tr><td class="px-48" align="center" style="padding:32px 48px 48px">
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:12px;color:rgba(241,236,223,0.55)">
Can't attend? <a href="${escapeHtml(declineUrl)}" style="color:#d4b884;text-decoration:underline">Let us know</a>
</p>
</td></tr>

<tr><td align="center" class="px-48" style="padding:32px 48px 40px;border-top:1px solid rgba(241,236,223,0.12);background-color:#0F0C09">
<p style="margin:0 0 8px;font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:18px;color:#d4b884">Château Privé</p>
<p style="margin:0;font-family:'EB Garamond',Georgia,serif;font-size:10px;color:rgba(241,236,223,0.45);letter-spacing:3px;text-transform:uppercase;line-height:1.8">Cannes &middot; 15 May 2026 &middot; Privately Hosted</p>
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
