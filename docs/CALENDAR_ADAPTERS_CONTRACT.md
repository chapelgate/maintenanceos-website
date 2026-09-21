# Calendar adapters contract (v0)

**Status:** v0 — flagged companion for ReceptionistOS + optional `/create` slot picker  
**Consumers:** `src/lib/calendar-create.ts`, `src/components/CalendarConnectPanel.tsx`  
**Implementation:** `packages/calendar-adapters` (`npm run calendar-adapters`)

This marketing site is a **static export** (`output: 'export'`). There are **no Next.js API routes**. `/create` talks to `NEXT_PUBLIC_CALENDAR_ENDPOINT` only when that value is an absolute `http:` or `https:` URL **and** `NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED` is `true`/`1`. If the public flag is off, the UI says calendar connect is coming / under testing and **must not** claim a booking.

## Base URL

Default local base: `http://127.0.0.1:8789/v1/calendar`.

The client appends `/slots`, `/bookings`, `/bookings/cancel`, `/bookings/reschedule`.

## List slots

```
POST {BASE}/slots
Content-Type: application/json
```

```json
{
  "from": "2026-09-21T00:00:00.000Z",
  "to": "2026-09-22T00:00:00.000Z",
  "timezone": "Europe/London",
  "durationMinutes": 30
}
```

HTTP **200**:

```json
{
  "ok": true,
  "data": [
    {
      "start": "2026-09-21T08:00:00.000Z",
      "end": "2026-09-21T08:30:00.000Z",
      "timezone": "Europe/London"
    }
  ]
}
```

An empty `data` array means no free workday slots were found. The client must not invent slots.

## Create booking

```
POST {BASE}/bookings
```

```json
{
  "start": "2026-09-21T08:00:00.000Z",
  "end": "2026-09-21T08:30:00.000Z",
  "timezone": "Europe/London",
  "title": "Adapter test"
}
```

HTTP **200** only when the adapter confirmed an id:

```json
{
  "ok": true,
  "data": {
    "id": "mock_booking_1",
    "provider": "mock",
    "start": "2026-09-21T08:00:00.000Z",
    "end": "2026-09-21T08:30:00.000Z",
    "timezone": "Europe/London",
    "title": "Adapter test",
    "status": "confirmed"
  }
}
```

No id → treat as failure. Do not display “booked”.

## Cancel / reschedule

```
POST {BASE}/bookings/cancel
{ "id": "mock_booking_1" }

POST {BASE}/bookings/reschedule
{ "id": "mock_booking_1", "start": "...", "end": "...", "timezone": "Europe/London" }
```

## Errors

```json
{ "ok": false, "error": "calendar_disabled", "message": "…" }
```

| Status | `error` | When |
| --- | --- | --- |
| 400 | `invalid_range` / `invalid_request` | Bad instants |
| 404 | `booking_not_found` | Unknown id |
| 409 | `slot_unavailable` | Conflict; **no new booking** |
| 413 | `payload_too_large` | Body larger than 8 KiB |
| 429 | `rate_limited` | More than 20 POSTs / minute / IP |
| 503 | `calendar_disabled` | `CALENDAR_ADAPTERS_ENABLED` is not `true`/`1` |
| 503 | `not_configured` / `auth_failed` | Google/Microsoft OAuth env missing or token exchange failed |
| 422 | `provider_error` | Provider did not confirm; **no invented booking** |

## CORS

Same expectation as `docs/FORM_ENDPOINT_CONTRACT.md`: `OPTIONS` → 204; allow `POST, OPTIONS` and `Content-Type, Accept`.

## Feature flags

- `CALENDAR_ADAPTERS_ENABLED=false` (default) — companion may listen for `/health`, but mutations are off.
- `CALENDAR_ADAPTER_PROVIDER=mock` (default) — or `google` / `microsoft`.
- Marketing `NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED` and `NEXT_PUBLIC_CALENDAR_ENDPOINT` — empty / false on DigitalOcean static by default. Hosted mock companion (optional, same free Render blueprint as sandbox): `docs/SANDBOX_DEPLOY.md`. Rebuild DigitalOcean after setting `NEXT_PUBLIC_*`.
- No live phone booking confirmation is exposed on this contract.
