# customer-dashboard

Claims-safe **customer dashboard** foundation for ReceptionistOS / MaintenanceOS: call history, transcript detail, and a bookings stub.

This is a **standalone Node package** (plus an optional HTTP companion). It is **not** a Next.js API route. The marketing site stays `output: 'export'` on DigitalOcean static hosting.

**Status:** local / staging foundation. **Off by default.** Not wired to live telephony. Sample rows are labelled **SAMPLE / DEMO**. An empty store invents nothing.

## What this is for

Fonio-class products show call history and transcripts after a sandbox test. This package is the website-side store for that UI — mock catalogue only. It does **not** attach live call sessions, recordings, or production metrics.

| Method | Meaning |
| --- | --- |
| `listSessions` | SAMPLE rows, or `[]` when the catalogue is empty. |
| `getSession` | SAMPLE transcript for a known demo id. Unknown id → `session_not_found` (nothing invented). |
| `listBookings` | Optional stub using the calendar-adapter booking shape, labelled SAMPLE. |

## Flags

| Env | Default | Purpose |
| --- | --- | --- |
| `CUSTOMER_DASHBOARD_ENABLED` | `false` | Master switch. When not `true`/`1`, the HTTP companion answers `503 dashboard_disabled`. |
| `CUSTOMER_DASHBOARD_DEMO_DATA` | `true` (when read) | `false`/`0` serves an empty store. Default is the labelled SAMPLE catalogue. Hosted path keeps SAMPLE / DEMO — not production analytics. |
| `CUSTOMER_DASHBOARD_HOST` | `127.0.0.1` | Companion bind address (keep loopback unless you intend otherwise). Hosted companions must use `0.0.0.0`. |
| `CUSTOMER_DASHBOARD_PORT` | `8791` | Companion listen port. If unset, `PORT` is used (Render injects this). |
| `CUSTOMER_DASHBOARD_CORS_ORIGIN` | echo request `Origin`, else `*` | CORS for the static site. One origin string; unset to allow seahorse-app and chapelgate staging together. |

Marketing UI uses a **separate** build-time flag, `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED` (also default false). Static export inlines `NEXT_PUBLIC_*`. See repo `.env.example`, `docs/CUSTOMER_DASHBOARD_CONTRACT.md`, and the $0 host runbook `docs/DASHBOARD_DEPLOY.md`.

## Run the companion locally

From the website repo root (Node 22+):

```bash
# Terminal 1 — companion still disabled until the flag is on
npm run customer-dashboard

# Enable SAMPLE catalogue for local/staging only
CUSTOMER_DASHBOARD_ENABLED=true npm run customer-dashboard
```

Health:

```bash
curl -s http://127.0.0.1:8791/health
```

List sessions / detail / bookings:

```bash
curl -s http://127.0.0.1:8791/v1/dashboard/sessions
curl -s http://127.0.0.1:8791/v1/dashboard/sessions/demo_session_1
curl -s http://127.0.0.1:8791/v1/dashboard/bookings
```

Empty store (no invented customers):

```bash
CUSTOMER_DASHBOARD_ENABLED=true CUSTOMER_DASHBOARD_DEMO_DATA=false npm run customer-dashboard
```

### Point `/dashboard` at it

```bash
# Terminal 2 — marketing site (static export inlines NEXT_PUBLIC_*)
NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED=true \
NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT=http://127.0.0.1:8791/v1/dashboard \
  npm run dev
```

If the public flag is on but the endpoint is empty, `/dashboard` uses an **in-browser mock** labelled SAMPLE / DEMO. If the flag is off (default), the page says the dashboard is coming / under testing and does not show sample history as live product.

DigitalOcean static hosting cannot run this process. Staging `/dashboard` needs a **separate** free-tier service (Render web service, not the frozen voice app) and a DigitalOcean **rebuild** after setting `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED` and `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT`. Runbook: `docs/DASHBOARD_DEPLOY.md`. No paid plan is required. SAMPLE / DEMO labels stay on every non-empty row — never present this as live production analytics.

## Honesty

- SAMPLE / DEMO labels are required on every non-empty row.
- Empty store → empty arrays. Do not invent customers.
- `telephony: false` on `/health`. Do not wire this to frozen live voice paths.

## Tests

From repo root: `npm test` (includes `src/*.test.ts` here).

```bash
node --experimental-strip-types --test packages/customer-dashboard/src/*.test.ts
```
