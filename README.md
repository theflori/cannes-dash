# Château Privé · EventOS Dashboard

Multi-page guest dashboard. Cloudflare Pages + Airtable + Apify.
Twilio-prepared, sidebar nav, white+gold theme.

---

## What's new (Phase 1 + 2)

**Phase 1 — UX/Navigation:**
- Sidebar nav (Guests, Messaging, Analytics, Branding, Logistics)
- Multi-page architecture under `/`
- White + Gold theme (replaces cream-only)
- Logout button, mobile responsive

**Phase 2 — Guest Management:**
- Click any status pill → menu with all 6 options
- Tags column (chips, filterable)
- Internal Notes column (inline-editable on hover)
- Bulk actions (select rows + change status for many)
- Stats grid: Total / Pending / Confirmed / VIP / IG data
- "Reload" button (re-fetch Airtable, no scrape, free & fast)
- Search includes notes
- Status options: Offen, Bestätigt, VIP, Warteliste, Abgelehnt, Geblockt

---

## File structure

```
/
├── index.html            ← redirect to /guests
├── guests.html           ← main page
├── branding.html         ← Phase 4 placeholder
├── login.html            ← refreshed
├── shared/
│   ├── theme.css         ← all design tokens
│   ├── sidebar.html      ← shared sidebar
│   └── app.js            ← shared utilities
└── functions/
    ├── _middleware.js    ← auth (allows /shared/ through)
    └── api/
        ├── login.js
        ├── logout.js              ← NEW
        ├── guests.js              ← UPDATED (returns tags + notes)
        ├── refresh.js
        ├── avatar.js
        ├── update-instagram.js    ← legacy
        ├── update-record.js       ← NEW (generic field update)
        ├── update-bulk.js         ← NEW (bulk status change)
        └── send-sms.js            ← NEW (Twilio stub)
```

---

## Required Airtable fields

Missing fields are handled gracefully (column just shows empty).

Required NEW fields if not yet present:
- **Tags** (Multiple select)
- **Internal Notes** (Long text)

Status options must match exactly:
`Offen, Bestätigt, VIP, Warteliste, Abgelehnt, Geblockt`

### Airtable AI Cobuilder prompt:

```
In table tblGNkr4kT6yWbpqN, add these two fields if they don't already exist:

1. Field name: "Tags"
   Type: Multiple select
   Options: leave empty initially (user will add tags as needed)

2. Field name: "Internal Notes"
   Type: Long text
   Rich formatting: No

Also verify the "Status" field is Single Select with these options:
Offen, Bestätigt, VIP, Warteliste, Abgelehnt, Geblockt
Add any missing options. Do not change the field type or remove existing options.

Do not modify any other field.
```

---

## Cloudflare Env Vars

Same 6 as before, no new required ones:
- `DASHBOARD_PASSWORD`
- `SESSION_SECRET`
- `AIRTABLE_TOKEN`
- `AIRTABLE_BASE_ID` = `appHcXDC9XhvjYnwa`
- `AIRTABLE_TABLE_NAME` = `tblGNkr4kT6yWbpqN`
- `APIFY_TOKEN`

Optional for Phase 3 (Twilio SMS):
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`

Without Twilio creds, send-sms endpoint runs in stub mode (logs message, no real send).

---

## Twilio integration plan (Phase 3)

System is status-trigger ready. To activate:
1. Add 3 Twilio env vars
2. Re-deploy
3. (Optional) Add "Send SMS" button to UI rows
4. (Optional) Auto-fire SMS on status change in `update-record.js`

Templates: see `send-sms.js` — `acceptance`, `vip`, `waitlist`, `decline`, `reminder`.

---

## Deploy

Push to GitHub → Cloudflare auto-deploys. After deploy, hard-reload browser (Cmd+Shift+R).

---

## Troubleshooting

**Sidebar missing:**
Check `/shared/sidebar.html` exists, and `_middleware.js` has `if (url.pathname.startsWith('/shared/'))`.

**Status menu opens but click does nothing:**
Status field in Airtable must exist as Single Select with the 6 status options.

**Tags column shows "—" everywhere:**
Tags field doesn't exist yet — add it as Multiple Select.

**500 error on update:**
Check ALLOWED_FIELDS list in `update-record.js`. Field names are case-sensitive.
