# calendar-adapters

Provider-agnostic **calendar book / reschedule** adapters for ReceptionistOS / MaintenanceOS.

This is a **standalone Node package** (plus an optional HTTP companion). It is **not** a Next.js API route. The marketing site stays `output: 'export'` on DigitalOcean static hosting.

**Status:** local / staging foundation. **Off by default.** Not wired to live telephony. Do not invent bookings when the flag is off, OAuth is missing, or a provider call fails.

## What this is for

ReceptionistOS can later plug this interface into sandbox tools (list free slots → create booking → cancel / reschedule). This PR does **not** implement phone booking confirmation voice flows.

| Method | Meaning |
| --- | --- |
| `listFreeSlots` | Workday gaps after subtracting busy periods. Empty list ≠ invented slots. |
| `createBooking` | `ok: true` only after the mock stores an id or Google/Microsoft returns an event id. |
| `cancelBooking` | Confirmed cancel only. Unknown ids → `booking_not_found`. |
| `rescheduleBooking` | Confirmed move only. Conflicts leave the original booking unchanged. |

Providers: `mock` (in-memory), `google` (Calendar API v3), `microsoft` (Microsoft Graph).

## Flags

| Env | Default | Purpose |
| --- | --- | --- |
| `CALENDAR_ADAPTERS_ENABLED` | `false` | Master switch. When not `true`/`1`, the factory returns a disabled adapter and the HTTP companion answers `503 calendar_disabled`. |
| `CALENDAR_ADAPTER_PROVIDER` | `mock` | `mock` \| `google` \| `microsoft` |
| `CALENDAR_ADAPTERS_HOST` | `127.0.0.1` | Companion bind address (keep loopback unless you intend otherwise). Hosted companions must use `0.0.0.0`. |
| `CALENDAR_ADAPTERS_PORT` | `8789` | Companion listen port. If unset, `PORT` is used (Render injects this). |
| `CALENDAR_ADAPTERS_CORS_ORIGIN` | echo request `Origin`, else `*` | CORS for the static site. One origin string; unset to allow seahorse-app and chapelgate staging together. |

Marketing UI uses a **separate** build-time flag, `NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED` (also default false). Static export inlines `NEXT_PUBLIC_*`. See repo `.env.example`, `docs/CALENDAR_ADAPTERS_CONTRACT.md`, and the $0 host runbook `docs/SANDBOX_DEPLOY.md` (calendar section). Hosted Render path is **mock** only.

## Run the mock adapter locally

From the website repo root (Node 22+):

```bash
# Terminal 1 — companion still disabled until the flag is on
npm run calendar-adapters

# Enable mock bookings for local/staging only
CALENDAR_ADAPTERS_ENABLED=true CALENDAR_ADAPTER_PROVIDER=mock npm run calendar-adapters
```

Health:

```bash
curl -s http://127.0.0.1:8789/health
```

List slots / book (ISO-8601 instants):

```bash
curl -s -X POST http://127.0.0.1:8789/v1/calendar/slots \
  -H 'Content-Type: application/json' \
  -d '{"from":"2026-09-21T00:00:00.000Z","to":"2026-09-22T00:00:00.000Z","timezone":"Europe/London"}'

curl -s -X POST http://127.0.0.1:8789/v1/calendar/bookings \
  -H 'Content-Type: application/json' \
  -d '{"start":"2026-09-21T08:00:00.000Z","end":"2026-09-21T08:30:00.000Z","timezone":"Europe/London","title":"Adapter test"}'
```

Cancel / reschedule:

```bash
curl -s -X POST http://127.0.0.1:8789/v1/calendar/bookings/cancel \
  -H 'Content-Type: application/json' \
  -d '{"id":"mock_booking_1"}'

curl -s -X POST http://127.0.0.1:8789/v1/calendar/bookings/reschedule \
  -H 'Content-Type: application/json' \
  -d '{"id":"mock_booking_1","start":"2026-09-21T10:00:00.000Z","end":"2026-09-21T10:30:00.000Z","timezone":"Europe/London"}'
```

### Point `/create` at it

```bash
# Terminal 2 — marketing site (static export inlines NEXT_PUBLIC_*)
NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED=true \
NEXT_PUBLIC_CALENDAR_ENDPOINT=http://127.0.0.1:8789/v1/calendar \
  npm run dev
```

If the public flag is on but the endpoint is empty, `/create` uses an **in-browser mock** labelled as local testing only. If the flag is off (default), the page says calendar connect is coming / under testing and does not show a booked confirmation.

DigitalOcean static hosting cannot run this process. Staging `/create` can use a **separate** free-tier mock service (Render web service, not the frozen voice app) after a DigitalOcean **rebuild** of `NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED` and `NEXT_PUBLIC_CALENDAR_ENDPOINT`. Runbook: `docs/SANDBOX_DEPLOY.md` (calendar section). No paid plan is required. Do not commit OAuth secrets.

## Google Calendar (OAuth, operator-configured)

Do **not** commit secrets. Create an OAuth client in Google Cloud, then store placeholders only in `.env.local`:

| Env | Notes |
| --- | --- |
| `GOOGLE_CALENDAR_CLIENT_ID` | OAuth client id |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | OAuth client secret |
| `GOOGLE_CALENDAR_REFRESH_TOKEN` | Offline refresh token you obtain once |
| `GOOGLE_CALENDAR_CALENDAR_ID` | Optional; default `primary` |

Authorize (offline + calendar scopes), then exchange the code for a refresh token with Google’s token endpoint (`grant_type=authorization_code`). Helpers: `googleAuthorizationUrl(clientId, redirectUri)` in `src/oauth.ts`.

```bash
CALENDAR_ADAPTERS_ENABLED=true \
CALENDAR_ADAPTER_PROVIDER=google \
GOOGLE_CALENDAR_CLIENT_ID=... \
GOOGLE_CALENDAR_CLIENT_SECRET=... \
GOOGLE_CALENDAR_REFRESH_TOKEN=... \
  npm run calendar-adapters
```

Missing env → `not_configured`. Token or API failure → `auth_failed` / `provider_error`. **No invented booking id.**

## Microsoft 365 / Outlook (OAuth, operator-configured)

App registration with `Calendars.ReadWrite` and `offline_access`. No paid Microsoft SKU is assumed beyond whatever mailbox the operator already has.

| Env | Notes |
| --- | --- |
| `MICROSOFT_CALENDAR_CLIENT_ID` | App (client) id |
| `MICROSOFT_CALENDAR_CLIENT_SECRET` | Client secret |
| `MICROSOFT_CALENDAR_REFRESH_TOKEN` | Offline refresh token |
| `MICROSOFT_CALENDAR_TENANT_ID` | Optional; default `common` |

Helper: `microsoftAuthorizationUrl(clientId, redirectUri, tenant?)`.

```bash
CALENDAR_ADAPTERS_ENABLED=true \
CALENDAR_ADAPTER_PROVIDER=microsoft \
MICROSOFT_CALENDAR_CLIENT_ID=... \
MICROSOFT_CALENDAR_CLIENT_SECRET=... \
MICROSOFT_CALENDAR_REFRESH_TOKEN=... \
  npm run calendar-adapters
```

## Plug into ReceptionistOS

```ts
import { createCalendarAdapter } from "@maintenanceos/calendar-adapters";

const calendar = createCalendarAdapter(); // respects CALENDAR_ADAPTERS_ENABLED
const slots = await calendar.listFreeSlots({
  from: new Date().toISOString(),
  to: new Date(Date.now() + 86400000).toISOString(),
  timezone: "Europe/London",
});
```

Do not call this from frozen live voice paths. Feature-flag any future tool wiring.

## Tests

From repo root: `npm test` (includes `src/*.test.ts` here).

```bash
node --experimental-strip-types --test packages/calendar-adapters/src/*.test.ts
```

Coverage: flag default off, mock contract (list / book / conflict / reschedule / cancel), Google/Microsoft `not_configured` + injected-fetch mapping, companion `503` when disabled.
