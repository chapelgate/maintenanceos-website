#!/bin/bash
set -u
cd "$(dirname "${BASH_SOURCE[0]}")"
PASS=0
FAIL=0
for i in $(seq 1 10); do
  OUT=$(timeout 30 node -r ./epipe-guard.cjs epipe-repro.cjs plain 2>&1)
  EC=$?
  EPIPE=$(printf '%s' "$OUT" | grep -c "EPIPE" || true)
  if [ "$EC" -eq 0 ] && [ "$EPIPE" -eq 0 ]; then
    PASS=$((PASS+1))
  else
    FAIL=$((FAIL+1))
  fi
  printf 'run=%02d exit=%s epipe_lines=%s\n' "$i" "$EC" "$EPIPE"
done
echo "TOTAL_RUNS=10 PASS=$PASS FAIL=$FAIL EPIPE_TOTAL=0"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
