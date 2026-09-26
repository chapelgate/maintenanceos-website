# Customer-dashboard companion deployment policy

**Status:** staging companion runbook
**Owner decision:** **do not use Render**. `render.yaml` is legacy / do not use.
**Marketing host:** DigitalOcean App Platform static export only.
**Companion host:** separate authorised DigitalOcean process when approved.

Code: `packages/customer-dashboard`
Start: `npm run customer-dashboard`
Contract: `docs/CUSTOMER_DASHBOARD_CONTRACT.md`

This companion serves labelled **SAMPLE / DEMO** data only. It is not a
customer portal, production analytics, live call history, or telephony.

## Hosted process boundary

When a DigitalOcean companion host is explicitly authorised:

- `CUSTOMER_DASHBOARD_HOST=0.0.0.0`
- `CUSTOMER_DASHBOARD_ENABLED=false` on first deploy
- `CUSTOMER_DASHBOARD_DEMO_DATA=true`
- platform `PORT` or `CUSTOMER_DASHBOARD_PORT`
- optional `CUSTOMER_DASHBOARD_CORS_ORIGIN`

Health: `GET /health`. Before enabling website wiring, verify
`telephony: false`. When enabled for demo data, verify
`dashboardEnabled: true` and `catalogKind: "demo"`.

Routes:

- `GET /v1/dashboard/sessions`
- `GET /v1/dashboard/sessions/{id}`
- `GET /v1/dashboard/bookings`

Unknown session ids must stay `404 session_not_found`; never invent customers.

## Static-site wiring

Only after the approved companion is healthy, set the DigitalOcean static app
build-time values and **Force Rebuild** / create a new deployment:

```text
NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED=true
NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT=https://<approved-companion-host>/v1/dashboard
```

The exact env names live in `src/config/site.ts`. The website remains
`output: 'export'`.

## Local verification

```bash
CUSTOMER_DASHBOARD_ENABLED=true npm run customer-dashboard
# then GET http://127.0.0.1:8791/health
```

SAMPLE rows remain SAMPLE after restart; an empty store must return empty
arrays rather than synthetic customers.

## Safety

Follow `docs/STAGING_COMPANIONS.md`.

Do not:
- apply `render.yaml`;
- attach the process to App Platform static hosting;
- create a duplicate website service;
- add live-history or Twilio credentials;
- touch `maintenanceos-redteam` / production voice;
- present SAMPLE data as production analytics.
