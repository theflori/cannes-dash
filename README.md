# Château Privé · Guest Dashboard

A separate Cloudflare Pages project that displays your RSVPs from Airtable
with Instagram follower counts and avatar pictures (scraped via Apify).

---

## What you get

- Sortable table of all RSVPs from Airtable
- Avatar pictures + follower counts via Apify scraper
- Search, status filter, min-followers filter
- One-click refresh (scrapes all profiles, ~30 sec for 200 guests)
- Per-row refresh for single guests
- Password-protected (cookie session, 30 days)

---

## Files in this project

```
/
├── index.html              ← Dashboard UI
├── login.html              ← Password login page
└── functions/
    ├── _middleware.js      ← Auth check on every request
    └── api/
        ├── login.js        ← POST /api/login
        ├── guests.js       ← GET /api/guests
        └── refresh.js      ← POST /api/refresh
```

---

## DEPLOY — step by step

### 1) Create new Cloudflare Pages project

1. Cloudflare Dashboard → Workers & Pages → **Create application** → **Pages** → **Direct Upload**
2. Project name: `chateau-dashboard` (or similar)
3. Drag the entire folder of this project into the upload area
4. Click **Deploy site**
5. After deploy: copy the temporary `*.pages.dev` URL (e.g. `chateau-dashboard.pages.dev`)

### 2) Set environment variables

In your new Pages project → **Settings** → **Environment variables** → **Production**:

Add these **5 variables** (click "+ Add variable" for each, all as **Plaintext**):

| Variable Name | Value |
|---|---|
| `DASHBOARD_PASSWORD` | `hubercannes2026!` |
| `SESSION_SECRET` | `pVw31x7BF3KXietwnqqDvSFmWMCcnKEUXHbp5szg_qxdPtNQRjB6Jrynrmt5Cadv` |
| `AIRTABLE_TOKEN` | (your Airtable Personal Access Token, same as RSVP project) |
| `AIRTABLE_BASE_ID` | `appHcXDC9XhvjYnwa` |
| `AIRTABLE_TABLE_NAME` | `tblGNkr4kT6yWbpqN` |
| `APIFY_TOKEN` | (your Apify Personal API token from apify.com → Settings → Integrations) |

⚠️ **After adding the variables, you MUST trigger a fresh deployment**, otherwise
the variables are not active. Go to Deployments tab → click the three dots
on the latest deploy → **Retry deployment**.

### 3) (Optional) Custom domain

If you want `dashboard.fraimit.com` instead of `chateau-dashboard.pages.dev`:

Settings → Custom domains → Set up custom domain → enter your subdomain.

If your DNS is **not in Cloudflare** (it isn't, based on prior conversation),
you'll need to add a CNAME record at your DNS provider pointing to the
Pages URL. Cloudflare will tell you the exact CNAME target.

---

## First use

1. Open the dashboard URL
2. Enter password: `hubercannes2026!`
3. You'll see all RSVPs — IG columns will be empty
4. Click **Refresh IG Data** in the top right
5. Wait ~30 seconds while Apify scrapes all profiles
6. Followers + avatars appear in the table

After the first refresh, you can sort by Followers, filter by minimum
followers (e.g. only show 10K+), and use the per-row refresh button
to update a single profile without re-scraping everyone.

---

## Cost

- **Cloudflare Pages**: Free
- **Airtable**: Free (existing setup)
- **Apify**: $5 free credit at signup → ~3000 profile lookups free
  - After credits: ~$1.60 per 1000 profiles → 200 guests = $0.32 per full refresh

For an event of your size, the $5 free credit covers all your needs.

---

## Security notes

- Password is stored as Cloudflare Pages secret (encrypted at rest)
- Session cookie is HttpOnly + Secure + SameSite=Lax
- Sessions are signed with HMAC-SHA256, expire after 30 days
- `_middleware.js` blocks unauthenticated access on all routes except /login
- `noindex,nofollow` meta tag prevents search engine indexing

If the password leaks: change `DASHBOARD_PASSWORD` env variable + retry deployment.
All existing sessions remain valid until they expire (30 days). To force-invalidate
all sessions, also rotate `SESSION_SECRET`.

---

## Troubleshooting

**Login page returns "Server not configured":**
→ Environment variables are missing or deployment was not retried after adding them.
Retry deployment in the Pages dashboard.

**"Failed to fetch from Airtable":**
→ Wrong AIRTABLE_TOKEN or AIRTABLE_BASE_ID.
Check token has read+write access to this base.

**"Apify scrape failed":**
→ Free credit might be exhausted, or APIFY_TOKEN is wrong.
Check apify.com → Billing for credit balance.

**Refresh runs but no data appears:**
→ Instagram handles in your Airtable might be malformed.
Make sure they're either `username` or `@username` (not full URLs).

**Per-row refresh fails for one specific user:**
→ That Instagram account is private, doesn't exist, or has been deleted.
Apify returns no data, dashboard skips silently.

---

## Files this project does NOT touch

- The RSVP form (separate Pages project on `chateau-cannes.fraimit.com`)
- Webhook function (`functions/webhook.js` in the RSVP project)
- Email templates / Resend
- Existing Airtable fields except `IG Followers`, `IG Avatar URL`, `IG Last Refresh`

The RSVP form and this dashboard are two completely independent Cloudflare Pages
projects that share one Airtable base.
