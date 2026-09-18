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

## Reconciled inventory (2026-09-18)

- **No dedicated MaintenanceOS Droplet exists.** Do not assume historical droplet names/IPs.
- HLO / Evidence Wallet / Cheap Trips DigitalOcean hosts are unrelated — never reuse.
- Permanent target: App Platform app `maintenanceos-london` (`.do/app.yaml`) via `scripts/provision_do_voice_app.py`.
- Secrets: `secrets_handler.py` (env + `/tmp/mos-secrets/` files). Never commit plaintext.
- Resend is optional for voice; absence must not block DO bring-up or N=2 voice verification.
- Credential polling timers (`n2-secrets-retry`) are cancelled permanently for this migration.
- Authoritative migration status: `docs/migration/DO_MIGRATION_REPORT.md`
