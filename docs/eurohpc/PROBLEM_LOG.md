# EuroHPC / LUMI master problem log

| ID | Problem | Status | Evidence / action |
|---|---|---|---|
| LUMI-001 | Original implementation PR #66 was stale/conflicted against current `main`. | RESOLVED | Rebuilt cleanly; PR #97 merged as `8cd59c8b337e5b78f87297871c0ab070c7312f67`. |
| LUMI-002 | Original Slurm templates wrote stdout/stderr into a directory that may not exist before Slurm opens the files. | RESOLVED | New jobs write scheduler logs at submit-root and create `artifacts/eurohpc/` only after execution starts. |
| LUMI-003 | Existing smoke test checked ROCm visibility but did not prove an AI runtime can see the GPU. | RESOLVED | Smoke test now uses the published LUMI AI Factory multitorch container and asserts PyTorch GPU availability. |
| LUMI-004 | Guest IdP exists, but the awarded project is not yet visible/attached and the live LUMI `project_<id>`, username, allocation dates and remaining hours are unknown. | BLOCKED-EXTERNAL | EuroHPC Federation Platform Ticket #56796 asks for project attach and these exact details. |
| LUMI-005 | No real smoke-test job evidence exists yet. | BLOCKED-BY-LUMI-004 | First live action after entitlement appears is the 10-minute one-GCD smoke test. |
| LUMI-006 | Initial connected Gmail search did not surface onboarding mail. | RESOLVED | Connected Outlook recovered the account trail: MyAccessID Guest IdP was activated 2026-09-21 under TT#2026091934000079. |
| LUMI-007 | EuroHPC helpdesk has not yet replied with project attachment/details after the 2026-09-23 follow-up. | OPEN | Last checked 2026-09-27; no newer Ticket #56796 reply found. |

Rule: failed attempts and new faults are appended here; resolved entries are retained as evidence.