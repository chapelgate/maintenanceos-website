# 16-dependency-scanning — OPERATING-RHYTHM.md

## Recurring checks to keep Dependency scanning (SBOM) (Security #16) true day to day

1. **Evidence currency check** — per release: Verify repo path/commit evidence for each control is current and points to real repo state, not stale. Status tracked in out/PROGRESS.md.

2. **CI gate verification** — per release: Confirm CI gates for this standard run green on all applicable product repos. Reference /home/andy/chapelgate/jobs-work-dell/readiness/semgrep/ and CI configs.

3. **FAILURE-LOG monitoring** — continuous: Log any gaps or regressions for this standard with date, build name, task, actual vs expected. Reference /root/jobs-work/readiness/FAILURE-LOG.md.

4. **Council A/B review** — per release cycle: Submit evidence package; obtain council MERGE at exact head with green gate. Record GO status in out/RESULT.md.

5. **Dell service validation** — per release: Confirm relevant Dell services (/home/andy/chapelgate/dell-services/) implement required controls (monitoring, backup, alerting, security).

## Wired to existing Dell timers/jobs

- **FAILURE-LOG** — every gap entry auto-logged; monitored by eggbot/watchdog
- **out/PROGRESS.md** — status lines appended after each check cycle
- **out/council-*.md** — council verdicts recorded after A/B review
- **ANDY-BRIEFING.md** — 5-line append per council GO (below CALL-20261115 markers)
- **TENDER-REGISTER.md** — status line appended per council review outcome
- **out/RESULT.md** — final GO/BLOCKED decision with second-model-family council GO
