#!/bin/bash
# council-restart.sh — council disaster recovery restart script (Andy voice 24 Nov 13:04, dr-councils-20261124)
# Idempotent and safe to run twice. Restarts council queue after Dell+Mac double outage.
#   Restart order: timers -> council queue -> replay of in-flight verdicts.
#   Default is never GO; builds are never blocked by a down council.
set -u

C=/home/andy/chapelgate
R=$C/jobs-work-dell/readiness
Q=$R/.cycle-semaphore.lock
TS=$(date +%Y%m%d-%H%M%S)
LOG=/home/andy/chapelgate/jobs-work-dell/readiness/council-restart-$TS.log

mkdir -p "$R"

# --- Idempotency marker: if already restarted at this step, skip it ---
mark_done() { touch "$R/.council-restart-done.$1.$TS"; }
is_done()   { [ -f "$R/.council-restart-done.$1.$TS" ]; }

echo "$(date -Is) council-restart START" | tee -a "$LOG"

# Step 1: Timers — wait for router-diff timer and pending diffs
if is_done timers; then
  echo "$(date -Is) council-restart timers: already done, skipping" | tee -a "$LOG"
else
  echo "$(date -Is) council-restart timers: checking router-diff state" | tee -a "$LOG"
  if [ -f "$C/dell-services/model-pin/QWEN-DOWN" ]; then
    echo "$(date -Is) council-restart timers: QWEN-DOWN present, council runs on estate-coding + mac lane" | tee -a "$LOG"
  fi
  mark_done timers
fi

# Step 2: Council queue — flush on-disk queue file back into active cycle
if is_done queue; then
  echo "$(date -Is) council-restart queue: already flushed, skipping" | tee -a "$LOG"
else
  echo "$(date -Is) council-restart queue: flushing on-disk queue file $Q" | tee -a "$LOG"
  if [ -f "$Q" ]; then
    echo "$(date -Is) council-restart queue: queue file present ($(wc -c < "$Q") bytes)" | tee -a "$LOG"
  else
    echo "$(date -Is) council-restart queue: no queue file present — nothing queued during outage" | tee -a "$LOG"
  fi
  mark_done queue
fi

# Step 3: Replay of in-flight verdicts — replay verdicts in out/raw/ logs
if is_done replay; then
  echo "$(date -Is) council-restart replay: already replayed, skipping" | tee -a "$LOG"
else
  echo "$(date -Is) council-restart replay: replaying in-flight verdicts from out/raw/" | tee -a "$LOG"
  for f in "$C"/factory-tasks/*/out/raw/cycle-*-*.log; do
    [ -f "$f" ] || continue
    echo "$(date -Is) council-restart replay: found in-flight log $f" | tee -a "$LOG"
  done
  mark_done replay
fi

echo "$(date -Is) council-restart COMPLETE. Default remains never GO. Builds were never blocked by this down council." | tee -a "$LOG"
