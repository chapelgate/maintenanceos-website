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
   - Protected Render runtime logs now correlate multiple historical carrier windows with `POST /voice/inbound` HTTP 200, accepted `WebSocket /voice/media-stream` connections and `/voice/stream-status` HTTP 204 callbacks.
   - Provider metadata independently establishes the corresponding completed inbound calls plus completed/no-answer outbound transfer attempts. The recovered 17-call sample includes several completed inbound calls from 5 to 63 seconds and both completed and no-answer transfer attempts.
   - Structured request logging is present for carrier ingress, including redacted request IDs and request duration without exposing credentials or full call identifiers.
   - Remaining evidence needed before PASS is provider-delivered signature result at the per-call level, the live Gemini event sequence/latency for the same calls, persisted intake/transcript evidence where approved, and complete per-call acceptance mapping.

6. **Harden and regression-test transfer / UK behaviour — PASS**
   - Current main has deterministic regressions for OpenAI/Gemini UK wording, 999/never-911, explicit-request-only human transfer, en-GB/Polly.Amy fallback and no-answer fallback.
   - Cloud CI and Security CI pass.

7. **Verify canonical DigitalOcean runtime — OPEN**
   - `chapelgate-production-01` is active in `lon1` with monitoring/private networking.
   - DigitalOcean confirms daily backups enabled with a 7-day retention policy.
   - Historical host audit confirms the MaintenanceOS compose project at `/srv/chapelgate/maintenanceos/app-new/docker-compose.yml`, API/worker/Postgres running, `/health` returning `ok=true`, `version=v1-pilot`, `realtime_voice=false`, and the API bound to loopback `127.0.0.1:18000`.
   - The Recovery ISO path was successfully reached over SSH. The real root partition was mounted at `/mnt`; the missing usr-merge links `/bin`, `/lib`, and `/lib64` were repaired and `chroot /mnt /bin/true` then passed. Docker 29.8.0 and Caddy 2.6.2 are present in the installed system.
   - Recovery mode was switched back to Boot from Hard Drive and the Droplet was powered off/on through DigitalOcean. The control plane reports the Droplet active, but current TCP 22 and HTTPS provider ingress are unreachable, so normal-boot host verification remains OPEN.
   - A fresh post-repair snapshot `chapelgate-production-01-post-repair-2026-09-14` was captured successfully before further recovery work.
   - A non-destructive clone from that snapshot was attempted as a fallback, but DigitalOcean rejected creation because the account Droplet limit is currently reached. No existing Droplet was deleted or rebuilt to make room.

8. **Close external environment evidence — OPEN**
   - Canonical DigitalOcean currently has `PUBLIC_BASE_URL` present and `VERIFY_TWILIO_SIGNATURES=true`.
   - Safety switches are confirmed off: realtime voice, public provider ingress, live email and live messaging.
   - Approved Twilio and Gemini credentials are present in the DigitalOcean API runtime; the dedicated test number and distinct human-transfer number are present and validated.
   - `TWILIO_TEST_NUMBER_CONFIRMED=true`, provider credential formats are valid, and the `local-closed` readiness profile previously passed with realtime/provider ingress disabled.
   - The trusted HTTPS provider endpoint was established and externally TLS-valid before the recovery incident. Current normal-boot reachability is OPEN because the host is not answering on the network after the hard-drive boot attempt.
   - Managed production PostgreSQL remains a production hardening item rather than a blocker for the isolated controlled-call test; the compose Postgres persistence gate was already proven separately.
   - Provider-delivered signature evidence on the corrected deployment, protected runtime logs/alerts, database restore rehearsal and least-privilege proof remain OPEN.

9. **Controlled carrier retest of corrected behaviour — OPEN**
   - This is a retest, not a first call.
   - Do not run until Steps 3–5, 7 and 8 have the required evidence.
   - Keep consequential AI side effects disabled and use the dedicated test route/synthetic data.

10. **Final release decision — OPEN**
   - Run the fixed checklist after evidence reconciliation.
   - Declare `MAINTENANCEOS FINAL — PASS` only when the intended release scope has no unevidenced blocker.

## Laptop footprint

Cloud work remains primary. GitHub Actions, DigitalOcean and protected provider/cloud logs should be used before local execution. The laptop is only a console/access bridge when a protected host action cannot be performed through cloud tooling.
