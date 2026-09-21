# Customer dashboard contract (v0)

**Status:** v0 — flagged foundation for ReceptionistOS call history / transcripts / bookings stubs  
**Consumers:** `src/lib/customer-dashboard.ts`, `src/components/CustomerDashboard.tsx`, `src/app/dashboard/page.tsx`  
**Implementation:** `packages/customer-dashboard` (`npm run customer-dashboard`)

This marketing site is a **static export** (`output: 'export'`). There are **no Next.js API routes**. `/dashboard` talks to `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT` only when that value is an absolute `http:` or `https:` URL **and** `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED` is `true`/`1`. If the public flag is off, the UI says the dashboard is coming / under testing and **must not** present sample rows as live production metrics.

## Honesty

- Every non-empty session, transcript turn, and booking is labelled **SAMPLE** / **DEMO**.
- An empty store returns empty arrays. Clients must not invent customers.
- `telephony: false` on `/health`. This contract does not expose frozen live voice paths.

## Base URL

Default local base: `http://127.0.0.1:8791/v1/dashboard`.

The client appends `/sessions`, `/sessions/{id}`, `/bookings`.

## List sessions

```
GET {BASE}/sessions
```

HTTP **200**:

```json
{
  "ok": true,
  "data": {
    "kind": "demo",
    "disclaimer": "SAMPLE / DEMO catalogue only. …",
    "sessions": [
      {
        "id": "demo_session_1",
        "kind": "demo",
        "sampleLabel": "SAMPLE",
        "startedAt": "2026-09-18T09:12:00.000Z",
        "endedAt": "2026-09-18T09:15:04.000Z",
        "durationSeconds": 184,
        "direction": "inbound",
        "outcome": "caller_left_details",
        "summary": "SAMPLE — boiler callback request …",
        "callerDisplay": "Sample caller A (demo) · +44 7700 900001"
      }
    ]
  }
}
```

`kind: "empty"` with `sessions: []` means the store has no rows. The client must not invent customers.

Rows missing `kind: "demo"` + `sampleLabel: "SAMPLE"` are dropped by the marketing mapper.

## Session + transcript

```
GET {BASE}/sessions/demo_session_1
```

HTTP **200** only for a known labelled SAMPLE id:

```json
{
  "ok": true,
  "data": {
    "kind": "demo",
    "disclaimer": "SAMPLE / DEMO catalogue only. …",
    "session": { "id": "demo_session_1", "sampleLabel": "SAMPLE" },
    "transcript": {
      "sessionId": "demo_session_1",
      "kind": "demo",
      "sampleLabel": "SAMPLE",
      "disclaimer": "SAMPLE transcript for local dashboard testing. …",
      "turns": [
        { "speaker": "assistant", "text": "SAMPLE: Hello, this is the ReceptionistOS demo desk. …" }
      ]
    }
  }
}
```

Unknown id → HTTP **404** `{ "ok": false, "error": "session_not_found" }`. No invented transcript.

## Bookings stub

```
GET {BASE}/bookings
```

Uses the calendar-adapter booking fields (`id`, `provider`, `start`, `end`, `timezone`, `title`, `status`) plus `kind`, `sampleLabel`, and `note`. Not a live phone booking confirmation.

## Errors

```json
{ "ok": false, "error": "dashboard_disabled", "message": "…" }
```

| Status | `error` | When |
| --- | --- | --- |
| 400 | `invalid_request` | Empty session id |
| 404 | `session_not_found` | Unknown id; **no invented row** |
| 429 | `rate_limited` | More than 30 GETs / minute / IP |
| 503 | `dashboard_disabled` | `CUSTOMER_DASHBOARD_ENABLED` is not `true`/`1` |

## CORS

`OPTIONS` → 204; allow `GET, OPTIONS` and `Content-Type, Accept`.

Staging `/dashboard` is cross-origin (DigitalOcean static → Render companion). Unset `CUSTOMER_DASHBOARD_CORS_ORIGIN` echoes the browser `Origin` so `https://seahorse-app-4oasq.ondigitalocean.app` and a chapelgate custom origin both work. A single configured origin locks to that origin only. Details: `docs/DASHBOARD_DEPLOY.md`.

## Feature flags

- `CUSTOMER_DASHBOARD_ENABLED=false` (default) — companion may listen for `/health`, but list/detail are off.
- `CUSTOMER_DASHBOARD_DEMO_DATA` — omit or `true` for SAMPLE rows; `false`/`0` for an empty store.
- Marketing `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED` and `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT` — empty / false on DigitalOcean static by default. To point staging `/dashboard` at a hosted companion, set the absolute `https://…/v1/dashboard` URL and the public flag on App Platform and **rebuild** (static export inlines `NEXT_PUBLIC_*`). Runbook: `docs/DASHBOARD_DEPLOY.md`.
- If the public flag is on and the endpoint is empty, `/dashboard` uses an in-browser mock labelled SAMPLE / DEMO.
- Hosted rows stay SAMPLE / DEMO. This contract does not expose production analytics.
- No live telephony history is exposed on this contract.
