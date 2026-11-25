# Council DR Drill Result

## Result: PASS

### Script Verification

- **council-restart.sh** executed successfully twice (idempotent)
- Both runs produced identical output confirming: timers checked, queue flushed, replay attempted, completion confirmed
- Default remains "never GO"; builds were never blocked by the down council

### Outage Simulation

- Dell host: marked down via `.dell-down` flag
- Mac lane: pointed at fake dead endpoint `http://127.0.0.1:9999/fake-dead-mac-endpoint`
- Council queue: paused during outage, resumed after restart script

### Key Behaviors Verified

1. **Queue persistence**: On-disk queue file persists verdicts across host outage
2. **Timer waiting**: Router-diff timer checked before resuming council
3. **Queue flush**: On-disk queue flushed back into active cycle
4. **Replay attempt**: In-flight verdicts replayed from out/raw/ logs
5. **Idempotency**: Script safe to run twice with identical results
6. **Build continuity**: Builds proceed independently; merge waits for council recovery

### SHA256 Hashes

- Script: `9df7c81310fbe386b4703473155c0d995e2934a6b55371ea95ad26aa9b426c3c`
- Runbook: `7c1f30bc5a177b001bf2fbe5d815fb17b8183f4f41600c719153c5054da85ce5`

### Drill Completion

- Throwaway council run: `council-dr-drill-20261124-132257`
- VERDICT.md written: ACCEPT
- OUTCOME.json written: COMPLETE with full recovery details
- Council sign-off: estate-coding GO + mac gpt-oss-120b GO

### Pass Count: 2/2
