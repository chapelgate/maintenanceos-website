#!/usr/bin/env bash
# canary.sh — Tiny always-on check every 10 min (user timer, not a suite).
# Checks: Dell disk/load, OmniRoute GET /v1/models + one 10-token call through estate-coding,
# one call to each top provider, Mac LM Studio via 172.17.0.1:11234 bridge, mac-lane ssh echo.
# Writes canary/status.json; on 2 consecutive failures appends to readiness/ALERTS.md.
# Format: <ISO time> | <severity> | <full name> | <what> | <auto action taken>

set -euo pipefail

CANARY_DIR="/home/andy/chapelgate/factory-tasks/estate-hardening-20261114/05-pins-canary-cost-alerts-orchestrator"
STATUS_FILE="$CANARY_DIR/canary/status.json"
ALERTS_FILE="/home/andy/chapelgate/jobs-work-dell/readiness/ALERTS.md"
LOG_FILE="$CANARY_DIR/out/canary.log"
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p "$(dirname "$STATUS_FILE")" "$(dirname "$LOG_FILE")"
exec >> "$LOG_FILE" 2>&1

echo "=== canary.sh $TS ==="

alert() {
    local severity="$1"
    local full_name="$2"
    local what="$3"
    local action="$4"
    local lockfile="$CANARY_DIR/out/canary.alerts.lock"
    (
        flock -n 9 || exit 1
        printf '%s | %s | %s | %s | %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$severity" "$full_name" "$what" "$action" >> "$ALERTS_FILE"
    ) 9>"$lockfile" || printf '%s | %s | %s | %s | %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$severity" "$full_name" "$what" "$action" >> "$ALERTS_FILE"
}

fail_count=0
PROVIDER_STATE_FILE="$CANARY_DIR/out/canary.provider_state"
if [[ -z "${OMNIROUTE_API_KEY:-}" ]]; then
    alert "FAIL" "canary.sh" "OMNIROUTE_API_KEY not set in environment" "Logged alert"
    echo "canary complete: 1 checks failed this run (consecutive: 1)"
    echo "1" > "$CANARY_DIR/out/canary.fail_count"
    exit 1
fi
declare -A prev_provider_state
if [[ -f "$PROVIDER_STATE_FILE" ]]; then
    while IFS='|' read -r pname pstate; do
        prev_provider_state["$pname"]="$pstate"
    done < "$PROVIDER_STATE_FILE"
fi
declare -A new_provider_state

# --- 1. Dell disk/load ---
disk_pct=$(df -P / 2>/dev/null | awk 'NR==2{print $5}' | tr -d '%' || echo "unknown")
loadavg=$(cat /proc/loadavg 2>/dev/null | cut -d' ' -f1 || echo "unknown")
disk_ok="ok"
if [[ "$disk_pct" =~ ^[0-9]+$ ]] && [[ "$disk_pct" -ge 90 ]]; then
    disk_ok="fail"
    fail_count=$((fail_count+1))
    alert "FAIL" "canary.sh" "Dell disk full: / at ${disk_pct}%" "Logged alert"
fi

# --- 2. OmniRoute GET /v1/models ---
omni_ok="ok"
status=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 -H "Authorization: Bearer $OMNIROUTE_API_KEY" http://127.0.0.1:20128/v1/models 2>/dev/null || echo "000")
if [[ "$status" != "200" ]]; then
    omni_ok="fail"
    fail_count=$((fail_count+1))
    alert "FAIL" "canary.sh" "OmniRoute GET /v1/models failed: HTTP $status" "Logged alert"
fi

# --- 3. One 10-token call through estate-coding ---
estate_ok="ok"
model_resp=$(curl -s --max-time 60 -H "Authorization: Bearer $OMNIROUTE_API_KEY" -H "Content-Type: application/json" -d '{"model":"estate-coding","messages":[{"role":"user","content":"Say hello in 10 tokens"}],"max_tokens":10}' http://127.0.0.1:20128/v1/chat/completions 2>/dev/null || echo "")
if ! echo "$model_resp" | grep -q '"choices"'; then
    estate_ok="fail"
    fail_count=$((fail_count+1))
    alert "FAIL" "canary.sh" "estate-coding 10-token call failed" "Logged alert"
fi

# --- 4. One call to each top provider ---
# Required lane: mistral/codestral-latest (FAIL on failure).
# Optional/free overflow providers: openrouter nemotron-3.5-super-vl:free, groq/groq/compound
# (WARN-only: never increment fail_count, never fail the run).
providers=(
    "openrouter/nvidia/nemotron-3.5-super-vl:free"
    "groq/groq/compound"
    "mistral/codestral-latest"
)
optional_providers="openrouter/nvidia/nemotron-3.5-super-vl:free groq/groq/compound"
provider_json=""
for p in "${providers[@]}"; do
    presp=$(curl -s --max-time 60 -H "Authorization: Bearer $OMNIROUTE_API_KEY" -H "Content-Type: application/json" -d "{\"model\":\"$p\",\"messages\":[{\"role\":\"user\",\"content\":\"ping\"}],\"max_tokens\":5}" http://127.0.0.1:20128/v1/chat/completions 2>/dev/null || echo "")
    if echo "$presp" | grep -q '"choices"'; then
        provider_json+="{\"name\":\"$p\",\"status\":\"ok\",\"detail\":\"responded with choices\"},"
        new_provider_state["$p"]="ok"
    else
        provider_json+="{\"name\":\"$p\",\"status\":\"fail\",\"detail\":\"no choices\"},"
        new_provider_state["$p"]="fail"
        prev_state="${prev_provider_state[$p]:-}"
        if [[ "$prev_state" != "fail" ]]; then
            alert "WARN" "canary.sh" "Provider $p unreachable" "Logged alert"
        fi
        # Optional/free providers never increment fail_count; required lanes (e.g. mistral/codestral-latest) do.
        if ! echo " $optional_providers " | grep -q " $p "; then
            fail_count=$((fail_count+1))
        fi
    fi
done
provider_json=${provider_json%,}

# Persist provider state for state-change WARN logic
> "$PROVIDER_STATE_FILE"
for p in "${!new_provider_state[@]}"; do
    printf '%s|%s\n' "$p" "${new_provider_state[$p]}" >> "$PROVIDER_STATE_FILE"
done

# --- 5. Mac LM Studio via bridge ---
mac_lm_ok="ok"
mac_resp=$(curl -s --max-time 30 "http://172.17.0.1:11234/v1/models" 2>/dev/null || echo "")
if [[ -z "$mac_resp" ]]; then
    mac_lm_ok="fail"
    fail_count=$((fail_count+1))
    alert "WARN" "canary.sh" "Mac LM Studio bridge unreachable" "Logged alert"
fi

# --- 6. mac-lane ssh echo ---
mac_ssh_ok="ok"
mac_ssh=$(ssh -o BatchMode=yes -o ConnectTimeout=20 -o StrictHostKeyChecking=no -o ProxyCommand='nc -X 5 -x localhost:1055 %h %p' -p 2222 andrewcartwright@100.88.230.82 'echo canary-ok' 2>/dev/null || echo "")
if [[ "$mac_ssh" != "canary-ok" ]]; then
    mac_ssh_ok="fail"
    fail_count=$((fail_count+1))
    alert "WARN" "canary.sh" "Mac lane ssh echo failed" "Logged alert"
fi

# --- Write status.json ---
python3 - "$STATUS_FILE" "$TS" "$fail_count" "$disk_ok" "$loadavg" "$omni_ok" "$estate_ok" "$provider_json" "$mac_lm_ok" "$mac_ssh_ok" <<'PYEOF'
import json, sys
status_file, ts, fail_count, disk_ok, loadavg, omni_ok, estate_ok, provider_json, mac_lm_ok, mac_ssh_ok = sys.argv[1:11]
providers = json.loads("[" + provider_json + "]") if provider_json else []
status = {
    "timestamp": ts,
    "fail_count": int(fail_count),
    "checks": {
        "disk": {"status": disk_ok, "detail": f"disk / at load={loadavg}"},
        "omniroute_models": {"status": omni_ok, "detail": f"GET /v1/models"},
        "estate_coding_call": {"status": estate_ok, "detail": "10-token call through estate-coding"},
        "providers": providers,
        "mac_lm_studio": {"status": mac_lm_ok, "detail": "via 172.17.0.1:11234 bridge"},
        "mac_lane_ssh": {"status": mac_ssh_ok, "detail": "ssh echo"},
    }
}
with open(status_file, "w") as f:
    json.dump(status, f, indent=2)
    f.write("\n")
PYEOF

# --- 2 consecutive failures -> ALERTS.md ---
FAIL_STATE_FILE="$CANARY_DIR/out/canary.fail_count"
prev=$(cat "$FAIL_STATE_FILE" 2>/dev/null || echo "0")
if [[ "$fail_count" -gt 0 ]]; then
    new_count=$((prev + 1))
else
    new_count=0
fi
echo "$new_count" > "$FAIL_STATE_FILE"

if [[ "$new_count" -ge 2 ]]; then
    alert "FAIL" "canary.sh" "Canary failed $new_count consecutive times" "Logged alert"
else
    echo "Canary fail count: $new_count" >> "$LOG_FILE"
fi

echo "canary complete: ${fail_count} checks failed this run (consecutive: $new_count)"