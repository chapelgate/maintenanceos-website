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
   - Protected Render runtime logs now prove accepted carrier WebSocket connections at `/voice/media-stream` during historical real-call windows and successful `/voice/stream-status` callbacks returning HTTP 204.
   - Provider metadata independently establishes the corresponding completed inbound calls and completed/no-answer transfer attempts.
   - Remaining evidence needed before PASS is provider-delivered signature result at the per-call level, realtime/Gemini event sequence and latency, persisted intake/transcript evidence where approved, and complete per-call acceptance mapping.

6. **Harden and regression-test transfer / UK behaviour — PASS**
   - Current main has deterministic regressions for OpenAI/Gemini UK wording, 999/never-911, explicit-request-only human transfer, en-GB/Polly.Amy fallback and no-answer fallback.
   - Cloud CI and Security CI pass.

7. **Verify canonical DigitalOcean runtime — OPEN**
   - `chapelgate-production-01` is active in `lon1` with monitoring/private networking.
   - DigitalOcean confirms daily backups enabled with a 7-day retention policy.
   - Host audit confirms the MaintenanceOS compose project at `/srv/chapelgate/maintenanceos/app-new/docker-compose.yml`, API/worker/Postgres running, `/health` returns `ok=true`, `version=v1-pilot`, `realtime_voice=false`, and the API is bound to loopback `127.0.0.1:18000`.
   - A trusted HTTPS endpoint now terminates at `maintenanceos.167-99-202-163.sslip.io` and only proxies the three `/voice/*` provider routes; non-provider paths return 404.
   - TLS verification succeeds externally and a POST to `/voice/inbound` fails closed with HTTP 503 while provider ingress remains disabled.
   - Current protected runtime logs plus final canonical-source verification are still required before this step can PASS.
   - Administrative SSH is currently rejecting the previously working key while the Droplet remains active; the DigitalOcean web console also reports SSH Connection Lost. This is an access-path blocker, not evidence of application failure.

8. **Close external environment evidence — OPEN**
   - Canonical DigitalOcean currently has `PUBLIC_BASE_URL` present and `VERIFY_TWILIO_SIGNATURES=true`.
   - Safety switches are confirmed off: realtime voice, public provider ingress, live email and live messaging.
   - Approved Twilio and Gemini credentials are now present in the DigitalOcean API runtime; the dedicated test number and distinct human-transfer number are present and validated.
   - `TWILIO_TEST_NUMBER_CONFIRMED=true`, provider credential formats are valid, and the `local-closed` readiness profile passes with realtime/provider ingress still disabled.
   - The trusted HTTPS provider endpoint is established and externally TLS-valid. Readiness profile semantics were corrected so pre-call public configuration keeps provider ingress disabled, while the controlled-call profile requires ingress plus live voice.
   - Managed production PostgreSQL remains a production hardening item rather than a blocker for the isolated controlled-call test; the compose Postgres persistence gate was already proven separately.
   - Provider-delivered signature evidence on the corrected deployment, protected runtime logs/alerts, database restore rehearsal and least-privilege proof remain OPEN.
   - Restoring protected administrative access is required before the latest canonical readiness profile adjustment can be deployed and re-verified on the host.

9. **Controlled carrier retest of corrected behaviour — OPEN**
   - This is a retest, not a first call.
   - Do not run until Steps 3–5, 7 and 8 have the required evidence.
   - Keep consequential AI side effects disabled and use the dedicated test route/synthetic data.

10. **Final release decision — OPEN**
   - Run the fixed checklist after evidence reconciliation.
   - Declare `MAINTENANCEOS FINAL — PASS` only when the intended release scope has no unevidenced blocker.

## Laptop footprint

Cloud work remains primary. GitHub Actions, DigitalOcean and protected provider/cloud logs should be used before local execution. The laptop is only a console/access bridge when a protected host action cannot be performed through cloud tooling.
