# MaintenanceOS Finalisation — 10 Steps

Date: 2026-09-14
Authoritative repo: `chapelgate/maintenanceos-v1-pilot`

Rule: fixed-checklist mode. Report PASS or OPEN only. Mark PASS only from current objective evidence. Real calls have already occurred; do not reset to a fictional first-call checkpoint.

1. **Reconcile source of truth — PASS**
   - Current `main` is authoritative.
   - `INPUTS_NEEDED_NEXT.md` overrides stale pre-call wording where they conflict.

2. **Verify cloud CI baseline — PASS**
   - Current main `103e4720a694af31a244af0dabe1b2e7ea74eb66` passes Cloud CI and Security CI.
   - Python 3.12/3.13 deterministic tests, TLS/WSS probe, production container build, non-root runtime, locked staging configuration, dependency audit, SBOM and secret-pattern guard pass.

3. **Audit the three observed live-call defects — OPEN**
   - Code inspection and regression tests confirm UK/British wording, 999/never-911 controls, explicit caller-request transfer and no-answer fallback.
   - Live carrier behaviour after the correction is not yet evidenced, so this remains OPEN.

4. **Recover provider call evidence — OPEN**
   - Historical sanitized provider probe established 17 recent Twilio call records including completed inbound calls, busy attempts, and outbound transfer attempts with completed/no-answer outcomes.
   - A new GitHub-hosted provider-evidence workflow ran successfully, but its redacted artifact reports provider credentials unavailable in that runner; therefore it did not recover fresh call rows.
   - No credential, telephone number, full SID, recording or transcript is committed to GitHub.

5. **Reconcile each historical real call against acceptance criteria — OPEN**
   - Provider metadata establishes that calls and transfers occurred, but protected runtime logs are still required for webhook/WSS, realtime events, latency and per-call acceptance mapping.

6. **Harden and regression-test transfer / UK behaviour — PASS**
   - Latest main adds deterministic regressions for OpenAI/Gemini UK wording, 999/never-911, explicit-request-only human transfer, en-GB/Polly.Amy fallback and no-answer fallback.
   - Cloud CI and Security CI pass on the same commit.

7. **Verify canonical DigitalOcean runtime — OPEN**
   - `chapelgate-production-01` exists in `lon1`, is active and has monitoring/private networking.
   - DigitalOcean confirms daily backups enabled with a 7-day retention policy.
   - Current host process/log/config verification is still required before this step can PASS.

8. **Close external environment evidence — OPEN**
   - Secret injection/rotation owner, trusted HTTPS/WSS, provider-delivered Twilio signature evidence, protected runtime logs/alerts, database restore rehearsal and least-privilege proof still require current canonical-deployment evidence.

9. **Controlled carrier retest of corrected behaviour — OPEN**
   - This is a retest, not a first call.
   - Do not run until Steps 3–5, 7 and 8 have the required evidence.
   - Keep consequential AI side effects disabled and use the dedicated test route/synthetic data.

10. **Final release decision — OPEN**
   - Run the fixed checklist after evidence reconciliation.
   - Declare `MAINTENANCEOS FINAL — PASS` only when the intended release scope has no unevidenced blocker.

## Laptop footprint

Cloud work remains primary. GitHub Actions, DigitalOcean and protected provider/cloud logs should be used before local execution. The laptop is only a console/access bridge when a protected host action cannot be performed through cloud tooling.