# MaintenanceOS Finalisation — 10 Steps

Date: 2026-09-14
Authoritative repo: `chapelgate/maintenanceos-v1-pilot`

Rule: fixed-checklist mode. Report PASS or OPEN only. Mark PASS only from current objective evidence. Real calls have already occurred; do not reset to a fictional first-call checkpoint.

1. **Reconcile source of truth — PASS**
   - Current `main` is authoritative.
   - `INPUTS_NEEDED_NEXT.md` overrides stale pre-call wording where they conflict.

2. **Verify cloud CI baseline — PASS**
   - Cloud CI and Security CI pass on current main.
   - Python 3.12/3.13 deterministic tests, TLS/WSS probe, production container build, non-root runtime, locked staging configuration, dependency audit, SBOM and secret-pattern guard pass.

3. **Audit the three observed live-call defects — OPEN**
   - Code inspection and regression tests confirm UK/British wording, 999/never-911 controls, explicit caller-request transfer and no-answer fallback.
   - Live carrier behaviour after the correction is not yet evidenced, so this remains OPEN.

4. **Recover provider call evidence — PASS**
   - Protected Render validation logs independently recover the historical sanitized provider evidence.
   - The Twilio provider probe reports an active/reachable account, dedicated configured test number, HTTPS POST `/voice/inbound` routing, public provider ingress enabled on the historical validation host, signature verification enabled, distinct transfer destination, and `voice_provider=gemini`.
   - The probe recovers 17 recent Twilio records: completed inbound calls, busy inbound attempts, completed outbound transfer attempts and no-answer outbound transfer attempts. SIDs remain hashed/redacted.
   - Render also records `GEMINI_CREDENTIAL_PRESENT`, `SYNTHETIC_VOICE_TENANT_READY` and `TWILIO_VOICE_WEBHOOK_READY`.
   - No credential, telephone number, full SID, recording or transcript is committed to GitHub.

5. **Reconcile each historical real call against acceptance criteria — OPEN**
   - Provider metadata establishes that calls and transfers occurred, but protected runtime logs are still required for webhook/WSS, realtime events, latency and per-call acceptance mapping.

6. **Harden and regression-test transfer / UK behaviour — PASS**
   - Current main has deterministic regressions for OpenAI/Gemini UK wording, 999/never-911, explicit-request-only human transfer, en-GB/Polly.Amy fallback and no-answer fallback.
   - Cloud CI and Security CI pass.

7. **Verify canonical DigitalOcean runtime — OPEN**
   - `chapelgate-production-01` is active in `lon1` with monitoring/private networking.
   - DigitalOcean confirms daily backups enabled with a 7-day retention policy.
   - Host audit confirms the MaintenanceOS compose project at `/srv/chapelgate/maintenanceos/app-new/docker-compose.yml`, API/worker/Postgres running, `/health` returns `ok=true`, `version=v1-pilot`, `realtime_voice=false`, and the API is bound to loopback `127.0.0.1:18000`.
   - Current protected runtime logs and full config evidence are still required before this step can PASS.

8. **Close external environment evidence — OPEN**
   - Canonical DigitalOcean currently has `PUBLIC_BASE_URL` present and `VERIFY_TWILIO_SIGNATURES=true`.
   - Safety switches are confirmed off: realtime voice, public provider ingress, live email and live messaging.
   - Canonical DigitalOcean currently reports `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_TEST_NUMBER`, `OPENAI_API_KEY` and `GEMINI_API_KEY` missing from the API container. This is the immediate deployment blocker.
   - Protected Render evidence confirms working historical Twilio credentials and a Gemini credential existed on the validation host, but the available Render connector does not expose secret values for export.
   - Secret injection/rotation ownership, trusted HTTPS/WSS, provider-delivered Twilio signature evidence, protected runtime logs/alerts, database restore rehearsal and least-privilege proof remain OPEN.

9. **Controlled carrier retest of corrected behaviour — OPEN**
   - This is a retest, not a first call.
   - Do not run until Steps 3–5, 7 and 8 have the required evidence.
   - Keep consequential AI side effects disabled and use the dedicated test route/synthetic data.

10. **Final release decision — OPEN**
   - Run the fixed checklist after evidence reconciliation.
   - Declare `MAINTENANCEOS FINAL — PASS` only when the intended release scope has no unevidenced blocker.

## Laptop footprint

Cloud work remains primary. GitHub Actions, DigitalOcean and protected provider/cloud logs should be used before local execution. The laptop is only a console/access bridge when a protected host action cannot be performed through cloud tooling.