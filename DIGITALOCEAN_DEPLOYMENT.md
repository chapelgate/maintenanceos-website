# DigitalOcean deployment target

DigitalOcean is the preferred production cloud target for MaintenanceOS so Chapelgate applications can be consolidated under one provider while GitHub remains the source of truth.

## Current safe deployment shape

- Platform: DigitalOcean App Platform
- Region: London (`lon`)
- Source: `chapelgate/maintenanceos-v1-pilot` `main`
- Build: repository `Dockerfile`
- Runtime: `uvicorn asgi:app` on port 8000
- Health check: `/health`
- Automatic production deploys: disabled until the first controlled deployment is verified
- Live provider ingress, realtime voice, live email, live messaging, contractor portal and remote AI side effects: disabled by default
- Twilio signature verification: enabled by default

The repository app spec is `.do/app.yaml`.

## Secrets that must be configured in DigitalOcean, never committed

- `DATABASE_URL`
- `APP_SECRET`
- `INTERNAL_API_TOKEN`
- `INTERNAL_API_CLIENT_ID`
- `GEMINI_API_KEY` (or `GOOGLE_API_KEY`)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `TWILIO_HUMAN_TRANSFER_NUMBER`
- Optional OpenAI fallback credentials
- Optional mail credentials

## Database rule

MaintenanceOS must use its own isolated PostgreSQL database. Do not reuse the Business Evidence Wallet or RSFM database. For production, prefer a DigitalOcean Managed PostgreSQL database in the same region/VPC and inject its private connection URL as `DATABASE_URL`.

Do not deploy a dev database as the final production store because the production evidence chain requires durable persistence and backup/restore evidence.

## Activation sequence

1. Confirm the correct DigitalOcean team/account and that App Platform resources are visible.
2. Authorize the private GitHub repository to DigitalOcean.
3. Provision an isolated production PostgreSQL database only after the paid-resource boundary is explicitly approved.
4. Configure encrypted runtime secrets.
5. Deploy with live provider features still disabled.
6. Verify `/health`, readiness, database persistence and restart/redeploy persistence.
7. Enable only the controlled test-number voice path.
8. Run the controlled Gemini call acceptance test.
9. Only after evidence passes, enable a limited monitored production pilot.

## Migration rule

The existing Render validation deployment remains untouched until the DigitalOcean deployment has passed the same or stronger verification. Do not delete or redirect production traffic merely because a DigitalOcean resource exists.

## Secrets / USH (2026-09-19)

- **Do not** inject `DIGITALOCEAN_TOKEN` into Cursor Cloud Agent secrets for MaintenanceOS.
- DigitalOcean credentials belong in **USH encrypted vault** (`DO_USH_DEPLOY` on canonical production v2 `https://138.68.183.183`; v1 is standby only).
- MOS identity is a **renewable Ed25519 workload keypair** (`ush_identity.py`), not a permanent copy of USH’s 3600s `issue_token()` bearer.
- Short-lived USH bearers are minted via `POST /v1/auth/workload` and auto-refreshed before expiry; fail closed on renewal/revocation failure.
- See `docs/migration/USH_IDENTITY_LIFECYCLE.md`. **Do not merge PR #57** until lifecycle tests stay green.
- **STOP:** do not request human bootstrap until identity lifecycle is accepted.

