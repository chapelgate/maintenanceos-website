# EuroHPC / LUMI master problem log

| ID | Problem | Status | Evidence / action |
|---|---|---|---|
| LUMI-001 | Original implementation PR #66 is stale/conflicted against current `main`. | RESOLVED | Rebuilt cleanly from current `main` on `eurohpc/lumi-5000gpuh-v2`. |
| LUMI-002 | Original Slurm templates wrote stdout/stderr into a directory that may not exist before Slurm opens the files. | RESOLVED | New jobs write scheduler logs at submit-root and create `artifacts/eurohpc/` only after execution starts. |
| LUMI-003 | Existing smoke test checked ROCm visibility but did not prove an AI runtime can see the GPU. | RESOLVED | Smoke test now uses the published LUMI AI Factory multitorch container and asserts PyTorch GPU availability. |
| LUMI-004 | Real LUMI project account, allocation dates and onboarding evidence are not present in the repository. | BLOCKED-HUMAN | Tracked in `HUMAN_BLOCKERS.md`; no compute is spent until resolved. |
| LUMI-005 | No real smoke-test job evidence exists yet. | BLOCKED-BY-LUMI-004 | First live action after access is the 10-minute one-GCD smoke test. |
| LUMI-006 | Connected Gmail search did not surface EuroHPC/LUMI onboarding mail. | OPEN | Continue using portal/account evidence; do not infer access from the award notice alone. |

Rule: failed attempts and new faults are appended here; resolved entries are retained as evidence.