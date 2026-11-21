# soc-2 — OPERATING-RHYTHM.md

## Recurring checks to keep SOC 2 TSC mapping true day to day

1. **TSC evidence currency check** — per release: Verify repo path/commit evidence for each TSC is current.
2. **CI gate verification** — per release: Confirm CI gates (semgrep, gitleaks, sbom) run green across product repos.
3. **FAILURE-LOG monitoring** — continuous: Log SOC 2-related gaps/regressions with date, build name, task, actual vs expected.
4. **Council A/B review** — per release cycle: Submit SOC 2 evidence package; obtain council MERGE at exact head.
5. **Backup/restore verification** — monthly: Confirm restic snapshot and restore proven.
6. **Secret scanning cadence** — per release: Confirm gitleaks clean across all 12 repos.

## Wired to existing Dell timers/jobs

- **FAILURE-LOG** — every gap entry auto-logged; monitored by eggbot/watchdog
- **out/PROGRESS.md** — status lines appended after each check cycle
- **out/council-*.md** — council verdicts recorded after A/B review
- **ANDY-BRIEFING.md** — 5-line append per council GO (below CALL-20261115 markers)
- **TENDER-REGISTER.md** — status line appended per council review outcome
- **out/RESULT.md** — final GO/BLOCKED decision with second-model-family council GO

