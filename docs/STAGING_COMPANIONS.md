# Staging companions checklist (DigitalOcean + Render free)

**Status:** operator checklist — docs only; this file does **not** create Render or DigitalOcean resources  
**Staging host:** `https://seahorse-app-4oasq.ondigitalocean.app/`  
**Do not:** attach companions to DigitalOcean static hosting, add Next.js API routes, copy `.env.example.fonio-local` onto App Platform, or edit frozen live telephony (`maintenanceos-redteam` / production voice on Render).

The marketing site stays `output: 'export'`. Companion URLs and flags are inlined at **`npm run build`**. A runtime-only App Platform restart is not enough.

This is not production Fonio-parity, not a live phone number, and not a spend request. Free Render services sleep after **15 minutes** idle. Do **not** add a payment method or raise a spend limit to keep them up.

## Runbooks (do not duplicate clicks here)

Create / enable each companion with its own runbook. This page is the **order of operations** for staging after those services exist.

| Companion | Runbook | Distinct Render service name (`render.yaml`) |
| --- | --- | --- |
| Onboarding scan | [`ONBOARDING_SCAN_DEPLOY.md`](ONBOARDING_SCAN_DEPLOY.md) | `maintenanceos-onboarding-scan` |
| Sandbox test-call (+ optional mock calendar) | [`SANDBOX_DEPLOY.md`](SANDBOX_DEPLOY.md) | `maintenanceos-sandbox-test-call`, optional `maintenanceos-calendar-adapters` |
| Customer dashboard (SAMPLE / DEMO) | [`DASHBOARD_DEPLOY.md`](DASHBOARD_DEPLOY.md) | `maintenanceos-customer-dashboard` |
| Local loopback (not staging) | [`FONIO_LOCAL_E2E.md`](FONIO_LOCAL_E2E.md) | none — loopback ports only |

Contracts: [`ONBOARDING_SCAN_CONTRACT.md`](ONBOARDING_SCAN_CONTRACT.md), [`SANDBOX_TEST_CALL_CONTRACT.md`](SANDBOX_TEST_CALL_CONTRACT.md), [`CALENDAR_ADAPTERS_CONTRACT.md`](CALENDAR_ADAPTERS_CONTRACT.md), [`CUSTOMER_DASHBOARD_CONTRACT.md`](CUSTOMER_DASHBOARD_CONTRACT.md).

Public env **names** are verified in `src/config/site.ts`. Leave values empty / `false` in git (`.env.example`). Never commit live Render URLs as required defaults.

## Exact DigitalOcean `NEXT_PUBLIC_*` (App Platform)

DigitalOcean Control Panel → **Apps** → maintenanceos-website static app (`seahorse-app-4oasq` today) → **Settings** → **App-Level Environment Variables** → **Edit**.

Do **not** encrypt these — they are public in the JS bundle. Scope must include **build time**.

Replace `<name>` with the Render service hostname the operator copied (service page header). Paths below are the client prefixes, not `/health`.

| Key (exact) | Typical value after the companion exists | Surface |
| --- | --- | --- |
| `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` | `https://<name>.onrender.com/v1/onboarding/scan` | `/create` crawl |
| `NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED` | `true` | `/create` calendar panel |
| `NEXT_PUBLIC_CALENDAR_ENDPOINT` | `https://<name>.onrender.com/v1/calendar` | `/create` calendar panel |
| `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED` | `true` | `/create` sandbox panel |
| `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT` | `https://<name>.onrender.com/v1/sandbox` | `/create` sandbox panel |
| `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED` | `true` | `/dashboard` |
| `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT` | `https://<name>.onrender.com/v1/dashboard` | `/dashboard` |

Already expected on this staging app (not companion-specific; do not blank them to “enable” companions):

| Key | Staging value |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://seahorse-app-4oasq.ondigitalocean.app` |
| `NEXT_PUBLIC_ENVIRONMENT` | `staging` |
| `NEXT_PUBLIC_PUBLIC_LAUNCH` | `false` |
| `NEXT_PUBLIC_FORM_ENDPOINT` | leave empty unless a **separate** contract-compliant lead endpoint exists |

Companion **process** flags (`ONBOARDING_WEB_INGEST`, `SANDBOX_TEST_CALL_ENABLED`, `CALENDAR_ADAPTERS_ENABLED`, `CUSTOMER_DASHBOARD_ENABLED`) live on Render, not App Platform. Turning a Render flag off does not need a DigitalOcean rebuild; turning **on** a Next public flag/endpoint **does**.

Omit a row (or leave the public flag `false` / endpoint empty) for any companion you are **not** wiring. `/create` and `/dashboard` then keep the honest queued / coming / under testing copy. Do not invent crawl results, live calls, bookings, or customer rows.

Do **not** paste loopback URLs (`http://127.0.0.1:8788` …) onto App Platform.

## Rebuild (required)

Static export inlines `NEXT_PUBLIC_*` at `npm run build`.

1. **Save** the App Platform env vars.
2. If a deployment does not start: **Overview** → **Create Deployment** / **Force Rebuild and Deploy** (wording varies).
3. Wait until the static app is live. Confirm the rebuilt bundle (not a previous deploy) before walking `/create/` or `/dashboard/`.

## Cold-start wake order

Each free web service sleeps independently after 15 minutes idle. `/create` waits **15 seconds** for scan; a cold POST may return “scan service is unavailable” and **must not invent** draft fields. Wake with `GET /health` until HTTP **200** (not merely TCP up).

Wake in the same order as the claims-safe loop (`URL → scan draft → calendar mock → scripted sandbox → SAMPLE dashboard`):

1. **Scan** — `GET https://<scan-name>.onrender.com/health`  
   Expect `"service":"maintenanceos-onboarding-scan"`. For live extract, `"ingestEnabled": true`.
2. **Mock calendar** (only if that sibling is hosted) — `GET https://<calendar-name>.onrender.com/health`  
   Expect `"service":"maintenanceos-calendar-adapters"`, `"telephony": false`. For slots, `"adaptersEnabled": true` and `"provider":"mock"`.
3. **Sandbox test-call** — `GET https://<sandbox-name>.onrender.com/health`  
   Expect `"service":"maintenanceos-sandbox-test-call"`, `"liveCall": false`. For scripted sessions, `"sandboxEnabled": true`.
4. **Customer dashboard** — `GET https://<dashboard-name>.onrender.com/health`  
   Expect `"service":"maintenanceos-customer-dashboard"`, `"telephony": false`. For SAMPLE list/detail, `"dashboardEnabled": true` and `"catalogKind":"demo"`.

Then open:

- `https://seahorse-app-4oasq.ondigitalocean.app/create/`
- `https://seahorse-app-4oasq.ondigitalocean.app/dashboard/` (only if the dashboard public flag was rebuilt on)

If a later step 502s or times out, re-wake **that** `/health` and retry. Do not treat a timeout as a connected call, a confirmed booking, or live history.

An existing $0 uptime ping to each `/health` (not GitHub Actions cron) can prevent spin-down.

Sandbox sessions and mock calendar bookings are **in-memory**. After sleep they are gone — create a new session / list slots again. Dashboard SAMPLE rows return when demo data is on; they are still demo, not recovered live history.

## Staging walk (honesty)

Use a **public HTTPS** business URL on `/create/` (for example `https://example.com/`).

| Step | Honest result |
| --- | --- |
| Scan mapped fields | Only returned strings are filled. Optional `fieldMeta` (source + confidence) is a **review hint** on filled fields. Empty keys stay empty. |
| Scan empty / failed / unset | Queued, empty, or failed copy. **No invented draft.** Hostname may seed `businessName` only when crawl is not configured. |
| Calendar mock | Local/hosted adapter testing. **Not** a phone booking. Google/Microsoft stay `not_configured` without secrets (this checklist does not add secrets). Do **not** claim Google Calendar is live on staging; OAuth start/callback is loopback-only. |
| Sandbox scripted | `scripted_demo_complete`, `liveCall: false`. WebRTC / live: `not_configured` / `live_call_forbidden`. **Must not** show a successful live customer call. |
| Dashboard | Labelled **SAMPLE / DEMO** rows only. Unknown ids stay `session_not_found`. **Must not** present production analytics. |
| Submit early access | `create_receptionist` lead. No number provisioned. Thank-you copy **must not** say email was sent. |

## What this still is not

- Not a Blueprint apply, not a Render “Create Web Service”, not a DigitalOcean env save from this git commit alone.
- Not `.env.example.fonio-local` on App Platform (that file is loopback only).
- Not frozen telephony. Not Fonio-parity voice.
- Not spend.
