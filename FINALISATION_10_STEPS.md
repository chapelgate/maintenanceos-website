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
   - The Twilio provider probe reports an active/reachable account, dedicated configured test number, HTTPS POST `/voice/inbound` routing, signature verification enabled, distinct transfer destination and `voice_provider=gemini` on the historical validation host.
   - The recovered sample contains completed inbound calls plus completed/no-answer outbound transfer attempts. Sensitive identifiers remain redacted.
   - Render also records `GEMINI_CREDENTIAL_PRESENT`, `SYNTHETIC_VOICE_TENANT_READY` and `TWILIO_VOICE_WEBHOOK_READY`.

5. **Reconcile each historical real call against acceptance criteria — OPEN**
   - Protected Render runtime logs correlate historical carrier windows with `POST /voice/inbound` HTTP 200, accepted `WebSocket /voice/media-stream` connections and `/voice/stream-status` HTTP 204 callbacks.
   - Remaining evidence before PASS is per-call provider signature result, same-call Gemini event sequence/latency, approved persisted intake/transcript evidence and complete acceptance mapping.

6. **Harden and regression-test transfer / UK behaviour — PASS**
   - Current main has deterministic regressions for OpenAI/Gemini UK wording, 999/never-911, explicit-request-only human transfer, en-GB/Polly.Amy fallback and no-answer fallback.
   - Cloud CI and Security CI pass.

7. **Verify canonical DigitalOcean runtime — PASS**
   - `chapelgate-production-01` was restored from the known-good 12 September snapshot after the installed system was found to have lost `/etc`.
   - The restored host now boots normally from hard disk. SSH is reachable again, `/etc` and `/srv/chapelgate` are present, systemd reports `running`, and Docker 29.8.0 is available.
   - MaintenanceOS application source is restored at `/srv/chapelgate/maintenanceos/recovered-e899990`. GitHub comparison confirms application code is unchanged relative to current main; only this tracker changed after `e899990`.
   - The API, worker and PostgreSQL containers are running; API and database health checks are healthy.
   - `/health` returns `ok=true`, `version=v1-pilot`, `realtime_voice=false` on loopback `127.0.0.1:18000`.
   - A full compose restart was completed and `/health` returned healthy again afterwards, proving current runtime restart/persistence behaviour.
   - The broken post-repair state and pre-recovery states remain protected by DigitalOcean snapshots.

8. **Close external environment evidence — OPEN**
   - Safety switches remain closed in the recovered configuration: realtime voice off, public provider ingress off, live email off and live messaging off.
   - The historical deployment had approved Gemini/Twilio credentials, dedicated test number, distinct transfer destination, signature verification and trusted HTTPS; the current restored host does not yet have those approved provider credentials restored.
   - Fresh current-host evidence required before PASS: secure provider credential restore, internal/test tenant configuration, recorded AI kill-switch state, dedicated test-number confirmation, `PUBLIC_BASE_URL`, signature verification, trusted HTTPS/WSS, protected logs and `local-closed` readiness on the restored host.
   - Caddy/TLS is not currently restored on this snapshot; ports 80/443 are not serving MaintenanceOS.
   - Managed production PostgreSQL remains a production-hardening item rather than a blocker for the isolated controlled-call retest once the safe external environment is restored.

9. **Controlled carrier retest of corrected behaviour — OPEN**
   - This is a retest, not a first call.
   - Do not enable provider ingress/realtime until the restored host reaches the controlled-call readiness profile.
   - Keep consequential AI side effects disabled and use only the dedicated test route and synthetic data.

10. **Final release decision — OPEN**
   - Run the fixed checklist after evidence reconciliation.
   - Declare `MAINTENANCEOS FINAL — PASS` only when the intended release scope has no unevidenced blocker.

## Laptop footprint

Cloud work remains primary. GitHub Actions, DigitalOcean and protected provider/cloud logs should be used before local execution. The laptop is only a console/access bridge when a protected host action cannot be performed through cloud tooling.
