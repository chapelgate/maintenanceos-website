# EuroHPC / LUMI master problem log

| ID | Problem | Status | Evidence / action |
|---|---|---|---|
| LUMI-001 | Original implementation PR #66 was stale/conflicted against current `main`. | RESOLVED | Rebuilt cleanly; PR #97 merged as `8cd59c8b337e5b78f87297871c0ab070c7312f67`. |
| LUMI-002 | Original Slurm templates wrote stdout/stderr into a directory that may not exist before Slurm opens the files. | RESOLVED | New jobs write scheduler logs at submit-root and create `artifacts/eurohpc/` only after execution starts. |
| LUMI-003 | Existing smoke test checked ROCm visibility but did not prove an AI runtime can see the GPU. | RESOLVED | Live corrected smoke run proved PyTorch 2.10.0+rocm7.0 sees one AMD Instinct MI250X. |
| LUMI-004 | Awarded project attachment / live LUMI account was not proven. | RESOLVED | Live LUMI association shows user `cartwrig` in `project_465003507` with `small-g` and `standard-g` access. |
| LUMI-005 | No real smoke-test job evidence existed. | RESOLVED | Slurm job 22562476 reached an MI200 GPU; corrected AI smoke job 22563389 allocated resources and reported `torch.cuda.is_available() = True`, GPU count 1, device AMD Instinct MI250X. |
| LUMI-006 | Initial connected Gmail search did not surface onboarding mail. | RESOLVED | Connected Outlook recovered the account trail: MyAccessID Guest IdP was activated 2026-09-21 under TT#2026091934000079. |
| LUMI-007 | Helpdesk reply / attachment status remained uncertain. | SUPERSEDED | Direct live access now proves the project is attached; no reply is needed to establish technical access. |
| LUMI-008 | Exact remaining GPU-hour balance and allocation delta have not yet been captured in durable evidence. | OPEN | Run `lumi-allocations` in the user-controlled LUMI session and archive the output before material benchmarks. |
| LUMI-009 | Existing `tests/red_team_corpus.json` inflates evidence with repeated templates whose only substantive change is a reference number. | IN-PROGRESS | Benchmark V2 forbids template inflation and replaces it with unique structured scenario families plus a disjoint hidden-final set. |
| LUMI-010 | Several old/diverged branches contain useful synthetic, interruption, outage, quality and red-team assets, but are too divergent from current `main` for wholesale merge. | IN-PROGRESS | Reuse concepts/fixtures selectively; backport only proven assets into the benchmark branch. Do not merge branch histories wholesale. |
| LUMI-011 | First live PyTorch smoke command had a quoting error. | RESOLVED | Corrected user-submitted job 22563389 passed PyTorch/ROCm GPU detection. |

Rule: failed attempts and new faults are appended here; resolved entries are retained as evidence.
