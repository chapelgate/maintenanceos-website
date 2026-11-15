#!/usr/bin/env bash
# orchestrator.sh — Always-on orchestrator, user timer every 2 min.
# Reads dashboard data (WATCHMAN.json / STATUS.md) and triages:
#  - suite idle >= 30 min: leave to hang watchdog
#  - suite failed or inactive without accepted MISSION_COMPLETE: STEER + leave for keepalive to relaunch
# Writes nothing to Andy; all alerts go to dr eggbot via ALERTS.md.

set -euo pipefail

DASHBOARD_DIR="/home/andy/chapelgate/dell-watch"
TASK_ROOT="/home/andy/chapelgate/factory-tasks"
WATCHMAN_JSON="$DASHBOARD_DIR/WATCHMAN.json"
ALERTS_FILE="/home/andy/chapelgate/jobs-work-dell/readiness/ALERTS.md"
LOG_FILE="/home/andy/chapelgate/factory-tasks/estate-hardening-20261114/05-pins-canary-cost-alerts-orchestrator/out/orchestrator.log"
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p "$(dirname "$LOG_FILE")"
exec >> "$LOG_FILE" 2>&1

echo "=== orchestrator.sh $TS ==="

alert() {
    local severity="$1"
    local full_name="$2"
    local what="$3"
    local action="$4"
    printf '%s | %s | %s | %s | %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$severity" "$full_name" "$what" "$action" >> "$ALERTS_FILE"
}

IDLE_THRESHOLD=30

# Build a map of suite -> state from watchman JSON
declare -A suite_state
if [[ -f "$WATCHMAN_JSON" ]]; then
    while IFS='|' read -r name st; do
        suite_state["$name"]="$st"
    done < <(python3 - "$WATCHMAN_JSON" <<'PYEOF'
import json, sys
wm = json.load(open(sys.argv[1]))
for b in wm.get("builds", []):
    name = b.get("full_name", "")
    state = b.get("state", "")
    print(f"{name}|{state}")
PYEOF
)
fi

# Process each suite dir under factory-tasks
for d in "$TASK_ROOT"/*/; do
    suite=$(basename "$d")
    [[ -f "$d/BRIEF.md" ]] || continue
    outdir="$d/out"

    # Check MISSION_COMPLETE
    mission_complete="$outdir/MISSION_COMPLETE"
    mission_accepted=false
    if [[ -f "$mission_complete" ]]; then
        first_line=$(head -1 "$mission_complete")
        if [[ "$first_line" == "PASS" || "$first_line" == "BLOCKED:"* ]]; then
            mission_accepted=true
        fi
    fi

    # If mission already accepted, nothing to do
    if [[ "$mission_accepted" == "true" ]]; then
        continue
    fi

    # Determine idle time from newest file in out/
    newest_mtime=0
    if [[ -d "$outdir" ]]; then
        newest_mtime=$(find "$outdir" -type f ! -path '*/runs/*' -printf '%T@\n' 2>/dev/null | sort -n | tail -1 | cut -d. -f1 || echo "0")
    fi
    now_ts=$(date +%s)
    idle_min=0
    if [[ -n "$newest_mtime" && "$newest_mtime" != "0" ]]; then
        idle_min=$(( (now_ts - newest_mtime) / 60 ))
    fi

    # Get state from watchman map
    state="${suite_state[$suite]:-UNKNOWN}"

    # Triage logic:
    # - idle >= 30 min: leave to hang watchdog (no STEER)
    if [[ "$idle_min" -ge "$IDLE_THRESHOLD" ]]; then
        echo "$TS: $suite idle ${idle_min}min -> leaving to hang watchdog"
        continue
    fi

    # - failed or inactive without accepted MISSION_COMPLETE: STEER + leave for keepalive
    if [[ "$state" == "FAILED" || "$state" == "STUCK" || "$state" == "IDLE" ]]; then
        steer_file="$d/STEER.md"
        printf '\n## STEER %s (orchestrator triage)\nSuite %s state=%s, no accepted MISSION_COMPLETE. Keepalive should relaunch it.\n' "$TS" "$suite" "$state" >> "$steer_file"
        alert "WARN" "orchestrator.sh" "Suite $suite ($state) without accepted MISSION_COMPLETE, steering keepalive to relaunch" "STEER appended"
        echo "$TS: $suite state=$state mission_accepted=$mission_accepted -> STEER appended"
    fi
done

echo "orchestrator complete"