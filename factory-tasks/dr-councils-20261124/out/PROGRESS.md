# Council DR Drill Progress

## Drill Execution

- Council restart script (`council-restart.sh`) executed successfully
- Script ran idempotently twice with identical output (verified)
- Both runs produced complete output with no errors
- Throwaway council drill (council-dr-drill-20261124-132257) completed: VERDICT.md and OUTCOME.json written

## Steps Completed

1. **Runbook**: `/home/andy/chapelgate/jobs-work-dell/readiness/COUNCIL-DR.md` created with full DR procedure
2. **Script**: `/home/andy/chapelgate/dell-services/council-dr/council-restart.sh` created - idempotent, safe to run twice
3. **Outage Simulation**: Dell down (.dell-down marker) + Mac lane at fake dead endpoint (http://127.0.0.1:9999/fake-dead-mac-endpoint)
4. **Restart Order**: Timers -> Council Queue -> Replay of in-flight verdicts
5. **Idempotency Proof**: Script ran twice in a row with identical raw output
6. **Drill Verification**: VERDICT.md and OUTCOME.json written after council-restart.sh completion
7. **PARKED.md**: "council DR host, for Andy" entry added

## Artifacts Generated

- `council-restart-<timestamp>.log` - detailed restart log for each run
- `.council-restart-done.{timers,queue,replay}.<timestamp>` - idempotency markers
- Script SHA256: `9df7c81310fbe386b4703473155c0d995e2934a6b55371ea95ad26aa9b426c3c`
- Runbook SHA256: `7c1f30bc5a177b001bf2fbe5d815fb17b8183f4f41600c719153c5054da85ce5`
- VERDICT.md in drill out/
- OUTCOME.json in drill out/

## Council Sign-Off

- **estate-coding**: GO
- **mac gpt-oss-120b**: GO (via mac-review.sh)
- **OUTCOME.json**: Written
- **Pass Count**: 2/2 (script idempotency + drill completion)

## Status: PASS - All BRIEF.md requirements satisfied
