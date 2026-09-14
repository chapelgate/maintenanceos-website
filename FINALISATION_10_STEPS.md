# MaintenanceOS Finalisation — 10 Steps

Date: 2026-09-14
Authoritative repo: `chapelgate/maintenanceos-v1-pilot`

Rule: mark PASS only from current evidence. Real calls have already occurred; do not reset to a fictional first-call checkpoint.

1. **Reconcile source of truth — PASS**
   - Current `main` is authoritative.
   - `INPUTS_NEEDED_NEXT.md` overrides stale pre-call wording where they conflict.

2. **Verify cloud CI baseline — PASS**
   - Current main passes Cloud CI and Security CI.
   - Python 3.12/3.13 deterministic tests, TLS/WSS probe, production container build, non-root runtime and locked staging configuration pass.

3. **Audit the three observed live-call defects — PASS for code inspection / OPEN for live evidence**
   - UK wording exists in both OpenAI and Gemini prompts.
   - 999/never-911 wording exists.
   - explicit caller-request transfer path and DTMF zero path exist.
   - Actual live behaviour still requires provider/runtime evidence.

4. **Recover provider call evidence — IN PROGRESS**
   - `scripts/reconcile_live_call_evidence.py` added.
   - `.github/workflows/provider-evidence.yml` executes it in GitHub-hosted cloud runners.
   - Output is privacy-redacted and excludes recordings/transcripts/secrets.

5. **Reconcile each historical real call against acceptance criteria — OPEN**
   - Requires provider metadata artifact plus protected runtime logs.

6. **Harden and regression-test transfer / UK behaviour — OPEN**
   - Add or strengthen deterministic regression tests where evidence identifies gaps.
   - Do not broaden transfer behaviour beyond explicit caller request without evidence.

7. **Verify canonical DigitalOcean runtime — PARTIAL PASS**
   - `chapelgate-production-01` exists in `lon1`, active, with monitoring/private networking/backups capability.
   - Runtime process/log/config verification still requires host-level protected access.

8. **Close external environment evidence — OPEN**
   - Secret injection/rotation owner, trusted HTTPS/WSS, Twilio signatures, logging/alerts, DB backup/restore and least privilege require current canonical-deployment evidence.

9. **Controlled carrier retest of corrected behaviour — BLOCKED until 4–8 are evidenced**
   - This is a retest, not a first call.
   - Keep consequential AI side effects disabled.

10. **Final release decision — OPEN**
   - Run the fixed checklist after evidence reconciliation.
   - Declare `MAINTENANCEOS FINAL — PASS` only when the intended release scope has no unevidenced blocker.

## Laptop footprint

No laptop work is required for steps that can run in GitHub Actions or DigitalOcean. Local execution is fallback only for protected credentials/MFA or host access unavailable to cloud tooling.
