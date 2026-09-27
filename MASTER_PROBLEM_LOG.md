# MaintenanceOS Master Problem Log

## 2026-09-27 — Temporary voice canary cost drift
Status: RESOLVED

- Problem: DigitalOcean droplet 602509753 (`maintenanceos-local-voice-canary-temp`) remained active at $48/month after Gemini/Gacrux became the accepted voice baseline.
- Safety requirement: do not disturb the accepted MaintenanceOS telephone path.
- Accepted baseline evidence: droplet 601962983, public endpoint 165.227.227.9, Gemini/Gacrux, frozen in commit 4f5bb42cbb267ad040273932a97e9090425496de.
- Preservation: snapshot 247299118 (`maintenanceos-local-voice-canary-final-archive-20260927`) completed and is available in lon1.
- Resolution: droplet 602509753 deleted after snapshot completion.
- Verification: accepted runtime droplet 601962983 remained active after deletion.
- Result: DigitalOcean Droplet plan run-rate reduced from $164/month to $116/month.

## 2026-09-27 — Concurrent live-host restore during cleanup
Status: RESOLVED

- Problem: while the canary archive was being created, an independent restore action (3434192169) ran against live droplet 601962983.
- Safety response: canary deletion was held.
- Restore completed at 2026-09-27T15:47:44Z.
- Verification: droplet 601962983 returned to active state before canary deletion proceeded.

## 2026-09-27 — Step 9 provider boundary was implicit
Status: RESOLVED

- Problem: realtime AI selection used direct provider branching and phone-number configuration was directly Twilio-specific, increasing the risk that a future provider integration would modify shared runtime logic.
- Constraint: preserve deterministic MaintenanceOS safety, tenant isolation, signatures, test-number gates and the accepted live telephone path.
- Resolution: added immutable allowlisted realtime and phone-provider adapter contracts around the existing implementations; no provider implementation or deterministic core logic was replaced.
- Fail-closed rule: unknown realtime providers close with WebSocket policy code 1008; unknown phone providers fail before provider-side webhook mutation.
- Safe defaults remain `ENABLE_PUBLIC_PROVIDER_INGRESS=false` and `ENABLE_REALTIME_VOICE=false`.
- Focused baseline before change: 20/20 tests passed.
- Focused post-change acceptance: 29/29 tests passed.
- Production routing, phone numbers, credentials and deployment were not changed.

## 2026-09-27 — Step 9 full-suite Windows collection mismatch
Status: OPEN — LINUX VERIFICATION IN PROGRESS

- Problem: the repository-wide pytest run cannot collect two existing concurrency tests on Windows because `concurrency_loadtest.py` imports the POSIX-only Python `resource` module.
- Evidence: `tests/test_concurrency_ladder.py` and `tests/test_concurrency_red_team.py` fail at import with `ModuleNotFoundError: No module named 'resource'` before any Step 9 test executes.
- WSL is installed only as a relay with no bash distribution; Docker Desktop Linux engine is not running.
- Response: do not weaken or skip the concurrency tests; verify the complete suite on the existing Linux estate runner lane instead.
- This is an execution-environment mismatch, not evidence of a Step 9 regression.

## 2026-09-27 — Existing TestClient deprecation warning
Status: OBSERVED — NON-BLOCKING

- Focused tests emit Starlette's existing `anyio.abc.BlockingPortal` deprecation warning.
- No dependency upgrade is being mixed into Step 9 because that would expand scope and regression risk; retain as follow-up maintenance evidence.
