# Sandbox test-call and mock-calendar deployment policy

**Status:** staging companion runbook
**Owner decision:** **do not use Render**. `render.yaml` is legacy / do not use.
**Marketing host:** DigitalOcean App Platform static export only.
**Companion host:** separate authorised DigitalOcean process when approved.

This file documents the sandbox/calendar hosting boundary. It does not create
infrastructure and it must not modify frozen live telephony.

## Sandbox test-call

Code: `packages/sandbox-test-call`
Start: `npm run sandbox-test-call`
Contract: `docs/SANDBOX_TEST_CALL_CONTRACT.md`

Required process settings when a DigitalOcean companion host is authorised:

- `SANDBOX_TEST_CALL_HOST=0.0.0.0`
- `SANDBOX_TEST_CALL_ENABLED=false` on first deploy
- platform `PORT` or `SANDBOX_TEST_CALL_PORT`
- optional `SANDBOX_TEST_CALL_CORS_ORIGIN`

Health: `GET /health`. The response must keep `telephony: false`,
`liveCall: false`, and `productionTelephony: false`.

When explicitly enabled, scripted mode may return
`scripted_demo_complete`. WebRTC must remain `not_configured`; live mode
must remain `live_call_forbidden`. This is not a phone service.

The static website only connects after these build-time values are deliberately
set and the DigitalOcean static app is rebuilt:

```text
NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED=true
NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT=https://<approved-companion-host>/v1/sandbox
```

## Optional mock calendar

Code: `packages/calendar-adapters`
Start: `npm run calendar-adapters`
Contract: `docs/CALENDAR_ADAPTERS_CONTRACT.md`

Authorised hosted settings:

- `CALENDAR_ADAPTERS_HOST=0.0.0.0`
- `CALENDAR_ADAPTERS_ENABLED=false` on first deploy
- `CALENDAR_ADAPTER_PROVIDER=mock`
- platform `PORT` or `CALENDAR_ADAPTERS_PORT`

Do not place Google/Microsoft OAuth credentials into a staging mock host.
Those OAuth flows remain operator/local scaffolds unless separately reviewed.

Static-site build-time wiring, only after health is proven:

```text
NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED=true
NEXT_PUBLIC_CALENDAR_ENDPOINT=https://<approved-companion-host>/v1/calendar
```

## Local verification

```bash
SANDBOX_TEST_CALL_ENABLED=true npm run sandbox-test-call
CALENDAR_ADAPTERS_ENABLED=true CALENDAR_ADAPTER_PROVIDER=mock npm run calendar-adapters
```

Default loopback ports are 8790 and 8789. Verify `/health` and the contract
routes before any staging wiring.

## DigitalOcean staging integration

Follow `docs/STAGING_COMPANIONS.md`. The marketing app remains
`output: 'export'`; `NEXT_PUBLIC_*` is inlined at build time, so a **rebuild**
is required after endpoint/flag changes.

Do not:
- attach companion processes to App Platform static hosting;
- add Next.js API routes to evade the static boundary;
- apply `render.yaml`;
- create a duplicate marketing app;
- touch `maintenanceos-redteam` / production voice;
- claim scripted sandbox or mock calendar as live telephony.

The exact public env names are defined in `src/config/site.ts`.
