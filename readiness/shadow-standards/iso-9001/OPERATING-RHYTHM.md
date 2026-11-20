# iso-9001 — OPERATING-RHYTHM.md

## Recurring checks to keep ISO 9001 QMS true day to day

1. **QMS artefact review** — weekly: Verify documented processes across all 12 product repos are current and accessible. Compare against FAILURE-LOG entries for QMS gaps. Status tracked in out/PROGRESS.md.

2. **Council A/B review** — per release cycle: Submit QMS evidence package; obtain council MERGE at exact head with green gate. Record GO status in out/RESULT.md.

3. **FAILURE-LOG monitoring** — continuous: Log any QMS-related gaps or regressions with date, build name, task, actual vs expected. Reference /root/jobs-work/readiness/FAILURE-LOG.md.

4. **Evidence currency check** — per release: Confirm repo path/commit evidence for each clause (4-10) is current and points to real repo state, not stale.

5. **OpenAPI schema drift check** — per release: Ensure documented API contracts match current implementation across products that expose APIs.

6. **Continuous improvement log** — per release: Record any QMS improvements, process changes, or lessons learned from incidents/FAILURE-LOG entries.

## Wired to existing Dell timers/jobs

- **FAILURE-LOG** — every QMS gap entry auto-logged; monitored by eggbot/watchdog
- **out/PROGRESS.md** — status lines appended after each check cycle
- **out/council-*.md** — council verdicts recorded after A/B review
- **ANDY-BRIEFING.md** — 5-line append per council GO (below CALL-20261115 markers)
- **TENDER-REGISTER.md** — status line appended per council review outcome
- **out/RESULT.md** — final GO/BLOCKED decision with second-model-family council GO