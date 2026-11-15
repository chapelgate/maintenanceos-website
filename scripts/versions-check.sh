#!/usr/bin/env bash
# versions-check.sh — Daily drift check against VERSIONS.lock.md
# Runs via user timer (systemd --user), writes drift to readiness/ALERTS.md
# Format: <ISO time> | <severity> | <full name> | <what> | <auto action taken>

set -euo pipefail

ALERTS_FILE="/home/andy/chapelgate/jobs-work-dell/readiness/ALERTS.md"
LOCK_FILE="/home/andy/chapelgate/jobs-work-dell/readiness/VERSIONS.lock.md"
LOG_FILE="/home/andy/chapelgate/factory-tasks/estate-hardening-20261114/05-pins-canary-cost-alerts-orchestrator/out/versions-check.log"
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

mkdir -p "$(dirname "$LOG_FILE")"
exec >> "$LOG_FILE" 2>&1

echo "=== versions-check.sh $TS ==="

alert() {
    local severity="$1"
    local full_name="$2"
    local what="$3"
    local action="$4"
    printf '%s | %s | %s | %s | %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$severity" "$full_name" "$what" "$action" >> "$ALERTS_FILE"
}

# Helper: get live value, return empty on failure
get_live() {
    local cmd="$1"
    eval "$cmd" 2>/dev/null || echo ""
}

# Helper: get lock value
get_lock() {
    local key="$1"
    grep "^${key}:" "$LOCK_FILE" | sed "s/^${key}: //" | head -1
}

# 1. OpenCode version
opencode_live=$(get_live "/home/andy/.opencode/bin/opencode --version")
opencode_lock=$(get_lock "version")
if [[ -n "$opencode_live" && -n "$opencode_lock" && "$opencode_live" != "$opencode_lock" ]]; then
    alert "WARN" "versions-check.sh" "OpenCode version drift: live=$opencode_live lock=$opencode_lock" "Logged drift"
fi

# 2. Node version
node_live=$(get_live "node --version")
node_lock=$(get_lock "node")
if [[ -n "$node_live" && -n "$node_lock" && "$node_live" != "$node_lock" ]]; then
    alert "WARN" "versions-check.sh" "Node version drift: live=$node_live lock=$node_lock" "Logged drift"
fi

# 3. npm version
npm_live=$(get_live "npm --version")
npm_lock=$(get_lock "npm")
if [[ -n "$npm_live" && -n "$npm_lock" && "$npm_live" != "$npm_lock" ]]; then
    alert "WARN" "versions-check.sh" "npm version drift: live=$npm_live lock=$npm_lock" "Logged drift"
fi

# 4. Python version
python_live=$(get_live "python3 --version" | sed 's/Python //')
python_lock=$(get_lock "python")
if [[ -n "$python_live" && -n "$python_lock" && "$python_live" != "$python_lock" ]]; then
    alert "WARN" "versions-check.sh" "Python version drift: live=$python_live lock=$python_lock" "Logged drift"
fi

# 5. Playwright version
playwright_live=$(get_live "npx playwright --version" | sed 's/Version //')
playwright_lock=$(get_lock "playwright")
if [[ -n "$playwright_live" && -n "$playwright_lock" && "$playwright_live" != "$playwright_lock" ]]; then
    alert "WARN" "versions-check.sh" "Playwright version drift: live=$playwright_live lock=$playwright_lock" "Logged drift"
fi

# 6. ffmpeg version
ffmpeg_live=$(get_live "ffmpeg -version" | head -1 | sed 's/.*version //' | sed 's/ .*//')
ffmpeg_lock=$(get_lock "ffmpeg")
if [[ -n "$ffmpeg_live" && -n "$ffmpeg_lock" && "$ffmpeg_live" != "$ffmpeg_lock" ]]; then
    alert "WARN" "versions-check.sh" "ffmpeg version drift: live=$ffmpeg_live lock=$ffmpeg_lock" "Logged drift"
fi

# 7. Docker version
docker_live=$(get_live "docker --version" | sed 's/.*version //' | sed 's/,.*//')
docker_lock=$(get_lock "docker")
if [[ -n "$docker_live" && -n "$docker_lock" && "$docker_live" != "$docker_lock" ]]; then
    alert "WARN" "versions-check.sh" "Docker version drift: live=$docker_live lock=$docker_lock" "Logged drift"
fi

# 8. OmniRoute image digest
omni_live=$(get_live "docker inspect diegosouzapw/omniroute:latest --format='{{index .RepoDigests 0}}'" | sed 's/.*@sha256:/sha256:/')
omni_lock=$(get_lock "image")
if [[ -n "$omni_live" && -n "$omni_lock" && "$omni_live" != "$omni_lock" ]]; then
    alert "WARN" "versions-check.sh" "OmniRoute image digest drift: live=$omni_live lock=$omni_lock" "Logged drift"
fi

# 9. OpenCode config auto-update check
if grep -q '"autoUpdate": true' /home/andy/.config/opencode/opencode.json 2>/dev/null; then
    alert "WARN" "versions-check.sh" "OpenCode config autoUpdate is enabled (should be off)" "Logged drift"
fi

# 10. Product repo lockfile hashes (spot-check a few)
for lockfile in \
    "/home/andy/chapelgate/factory-tasks/fixall-20261113/11-council-minutes/package-lock.json" \
    "/home/andy/chapelgate/factory-tasks/droplet-carry-housing-compliance-vault-build/repo/package-lock.json" \
    "/home/andy/chapelgate/factory-tasks/hlo-ten-customer-journeys-20261111/work/package-lock.json"; do
    if [[ -f "$lockfile" ]]; then
        hash=$(sha256sum "$lockfile" | cut -d' ' -f1)
        # Could check against lock file if stored there
    fi
done

# 11. Mac LM Studio models (via bridge)
mac_bridge="172.17.0.1:11234"
mac_live=$(get_live "curl -s http://$mac_bridge/v1/models 2>/dev/null | python3 -c 'import sys,json; d=json.load(sys.stdin); [print(m[\"id\"]) for m in d[\"data\"]]' 2>/dev/null | sort -u | tr '\n' ','")
if [[ -n "$mac_live" ]]; then
    # Just verify reachable, don't diff for now
    echo "Mac LM Studio reachable: $mac_live"
fi

echo "versions-check complete"