# Chapelgate Estate Brief Template

This template must be included by reference or copied into every BRIEF.md written for estate jobs.
Any brief that omits the router protection rule will be rejected at preflight.

---

## Mandatory: OmniRoute Production Protection

**NEVER stop/kill/restart/reconfigure the production OmniRoute container (127.0.0.1:20128).**
- Failover/forced-failure tests MUST target a throwaway instance or simulated target via env var (fake port/URL).
- Any plan referencing `docker stop|kill|rm omniroute` without an explicit test-container scope will be rejected.
- Verify 127.0.0.1:20128 serves a real completion before ending any cycle that touches the router.

---

## Mandatory: Scanner Binaries / Docker Pins

- **scanners: installed binaries (~/.local/bin) or pinned docker images only, never npx**

---

## Brief Content

[Write the brief below this line. The router protection rule above is enforced by job-run-v6 pre-cycle grep.]

---
## Raw test evidence (eggbot 21 Nov 2026, council-reviewed)
- Run every test, typecheck, lint and build command as `rt <name> -- <command>` (wrapper at dell-services/test-raw/rt, on PATH as ~/bin/rt).
- It tees raw output to out/raw/<name>-<ts>-output.log, writes out/raw/<name>-<ts>-exit-code.txt and out/raw/SHA (git rev-parse HEAD of ./repo).
- MISSION_COMPLETE and RESULT.md cite only out/raw files, copy pass counts exactly as printed, and take the full SHA only from out/raw/SHA.

## PR citations (eggbot 21 Nov 2026, public chief ask)
- Before writing any PR number into a readiness/report file, check it with `gh pr view <n> -R chapelgate/<repo> --json state,headRefOid` (gh is in ~/.local/bin). Name the repo on the same line and quote the state. Never cite a PR from memory or from an older file.
- dell-services/pr-cite-check/check.sh runs hourly and lists any PR it cannot find in readiness/PR-CITE-CHECK.md. Fix those rows the same day.
