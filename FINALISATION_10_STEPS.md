# MaintenanceOS Finalisation — 10 Steps

Date: 2026-09-14
Authoritative repo: `chapelgate/maintenanceos-v1-pilot`

Rule: fixed-checklist mode. Report PASS or OPEN only. Mark PASS only from current objective evidence. Real calls have already occurred; do not reset to a fictional first-call checkpoint.

1. **Reconcile source of truth — PASS**
   - Current `main` is authoritative.
   - DigitalOcean inventory is now explicitly separated by product before any host action.

2. **Verify cloud CI baseline — PASS**
   - Cloud CI and Security CI pass on the canonical application code.
   - Deterministic tests, TLS/WSS probe, production container build, non-root runtime, dependency audit, SBOM and secret-pattern guard pass.

3. **Audit the three observed live-call defects — OPEN**
   - Code inspection/regressions confirm UK/British wording, 999/never-911 controls, explicit caller-request transfer and no-answer fallback.
   - Fresh corrected carrier behaviour is still required.

4. **Recover provider call evidence — PASS**
   - Protected Render validation evidence confirms historical Gemini/Twilio configuration and real carrier activity with sensitive identifiers redacted.

5. **Reconcile historical real calls — OPEN**
   - Historical HTTP/WSS/callback evidence is correlated.
   - Per-call signature result, same-call Gemini sequence/latency, approved persisted intake/transcript evidence and complete acceptance mapping remain required.

6. **Harden and regression-test transfer / UK behaviour — PASS**
   - Deterministic regressions cover UK wording, 999/never-911, explicit-request-only transfer and no-answer fallback.

7. **Verify actual MaintenanceOS runtime — OPEN**
   - Live DigitalOcean inventory proves there is no dedicated MaintenanceOS Droplet.
   - `167.99.202.163` is `chapelgate-hlo-production` and must not be treated as MaintenanceOS production.
   - Render contains several MaintenanceOS validation/red-team services, including `maintenanceos-redteam-v2`, but they deploy the legacy `chapelgate/cloud-workers/jobs/maintenanceos` copy rather than the canonical repo.
   - Therefore no canonical production/pilot runtime is presently proven.
   - Creating new Render or Railway resources is currently blocked by account resource limits, so the preferred cloud-first recovery is to safely promote/reuse an existing MaintenanceOS Render service after canonical-source reconciliation.

8. **Close external environment evidence — OPEN**
   - Historical Render evidence proves Gemini/Twilio credentials and webhook readiness existed.
   - Current canonical-runtime evidence must still prove provider credentials, test number, transfer number, signatures, HTTPS/WSS, protected logging, closed safety flags and readiness on the actual selected runtime.

9. **Controlled carrier retest — OPEN**
   - Do not enable provider ingress/realtime until Steps 3–5, 7 and 8 have the required evidence.
   - Use the dedicated test route, synthetic data and disabled consequential AI side effects.

10. **Final release decision — OPEN**
   - Declare `MAINTENANCEOS FINAL — PASS` only when every intended fixed-checklist item is evidenced PASS.

## Current infrastructure map

- HLO: `chapelgate-hlo-production` — `167.99.202.163`
- Evidence Wallet: `chapelgate-production-wallet` — `46.101.16.174`
- Cheap Trips: `chapelgate-cheap-trips-production` — `206.189.112.98`
- MaintenanceOS: no dedicated DigitalOcean Droplet currently exists.

## Laptop footprint

Cloud work remains primary. GitHub, Render and protected provider/cloud evidence are preferred. The laptop is only an access bridge where no cloud action exists.
