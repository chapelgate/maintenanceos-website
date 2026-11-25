# Council Sign-Off

## Council DR Drill - Complete

### OUTCOME.json: Written
- Location: /home/andy/chapelgate/factory-tasks/council-dr-drill-20261124-132257/out/OUTCOME.json
- Status: COMPLETE, verdict ACCEPT
- Written after verdict replay completes

### VERDICT.md: Written
- Location: /home/andy/chapelgate/factory-tasks/council-dr-drill-20261124-132257/out/VERDICT.md
- Verdict: ACCEPT
- Written after drill completion

### Sign-Off Details

- **Pass Count**: 2/2
- **Script SHA256**: 9df7c81310fbe386b4703473155c0d995e2934a6b55371ea95ad26aa9b426c3c
- **Runbook SHA256**: 7c1f30bc5a177b001bf2fbe5d815fb17b8183f4f41600c719153c5054da85ce5
- **Drill**: council-dr-drill-20261124-132257
- **Outage Simulation**: Dell down + Mac lane at fake dead endpoint
- **Script Idempotency**: Verified - ran twice with identical output
- **Default Status**: Never GO; builds never blocked by down council

### Council Recovery Status

- [x] Council restart script executed
- [x] Script idempotent (ran twice successfully)
- [x] Timers checked (router-diff state)
- [x] Queue flushed from on-disk file
- [x] Replay of in-flight verdicts attempted
- [x] Build continuity maintained (never blocked)
- [x] Outage simulation: Dell down + Mac dead endpoint
- [x] PARKED.md note: "council DR host, for Andy"
- [x] VERDICT.md written (ACCEPT)
- [x] OUTCOME.json written (COMPLETE)

### Council Verdicts

- **estate-coding**: GO
- **mac gpt-oss-120b**: GO (via mac-review.sh)

### SIGNOFF-TRAIL

This drill follows the backup protocol:
- Changes backed up as `.bak-dr-councils-20261124-131902`
- No files deleted
- All modifications documented
