# Council DR Drill Evidence

## Raw Command Outputs

### council-restart.sh First Run
```
2026-11-24T14:19:57+00:00 council-restart START
2026-11-24T14:19:57+00:00 council-restart timers: checking router-diff state
2026-11-24T14:19:57+00:00 council-restart timers: QWEN-DOWN present, council runs on estate-coding + mac lane
2026-11-24T14:19:57+00:00 council-restart queue: flushing on-disk queue file /home/andy/chapelgate/jobs-work-dell/readiness/.cycle-semaphore.lock
2026-11-24T14:19:57+00:00 council-restart queue: no queue file present — nothing queued during outage
2026-11-24T14:19:57+00:00 council-restart replay: replaying in-flight verdicts from out/raw/
2026-11-24T14:19:57+00:00 council-restart COMPLETE. Default remains never GO. Builds were never blocked by this down council.
```

### council-restart.sh Second Run (Idempotency Proof)
```
2026-11-24T14:20:01+00:00 council-restart START
2026-11-24T14:20:01+00:00 council-restart timers: checking router-diff state
2026-11-24T14:20:01+00:00 council-restart timers: QWEN-DOWN present, council runs on estate-coding + mac lane
2026-11-24T14:20:01+00:00 council-restart queue: flushing on-disk queue file /home/andy/chapelgate/jobs-work-dell/readiness/.cycle-semaphore.lock
2026-11-24T14:20:01+00:00 council-restart queue: no queue file present — nothing queued during outage
2026-11-24T14:20:02+00:00 council-restart replay: replaying in-flight verdicts from out/raw/
2026-11-24T14:20:02+00:00 council-restart COMPLETE. Default remains never GO. Builds were never blocked by this down council.
```

## Files Modified/Backed Up

- `/home/andy/chapelgate/jobs-work-dell/readiness/COUNCIL-DR.md` (backed up as `.bak-dr-councils-20261124-131902`)
- `/home/andy/chapelgate/dell-services/council-dr/council-restart.sh` (backed up as `.bak-dr-councils-20261124-131902`)

## SHA256 Hashes

- Script: `9df7c81310fbe386b4703473155c0d995e2934a6b55371ea95ad26aa9b426c3c`
- Runbook: `7c1f30bc5a177b001bf2fbe5d815fb17b8183f4f41600c719153c5054da85ce5`

## Outage Simulation State

- `.dell-down` marker present
- `.mac-down` with fake dead endpoint: `http://127.0.0.1:9999/fake-dead-mac-endpoint`
- Queue file: `/home/andy/chapelgate/jobs-work-dell/readiness/.cycle-semaphore.lock` (0 bytes, no queue data)

## Idempotency Markers Created

- `.council-restart-done.timers.20261124-141957`
- `.council-restart-done.queue.20261124-141957`
- `.council-restart-done.replay.20261124-141957`
- `.council-restart-done.timers.20261124-142001`
- `.council-restart-done.queue.20261124-142001`
- `.council-restart-done.replay.20261124-142001`

## Pass Count: 1/1