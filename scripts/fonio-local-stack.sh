#!/usr/bin/env bash
# Local Fonio-loop companion stack (scan + calendar + sandbox, dashboard optional).
# Flags ON for this process only. Does not change DigitalOcean static hosting.
# Does not start Next.js, Twilio, or live telephony.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="${FONIO_LOCAL_DIR:-$ROOT/.data/fonio-local}"
ENV_FILE="${FONIO_LOCAL_ENV:-$ROOT/.env.example.fonio-local}"
COMPOSE_FILE="$ROOT/docker-compose.fonio-local.yml"

usage() {
  cat <<'EOF'
Usage: scripts/fonio-local-stack.sh <command> [options]

Commands:
  up        Start companions on loopback (default: scan + calendar + sandbox + dashboard)
  down      Stop companions started by this script
  status    Show PID files and /health
  logs      Tail companion logs (Ctrl-C to stop)
  help      This text

Options for up:
  --no-dashboard   Skip packages/customer-dashboard (port 8791)
  --form-stub      Also start the local form stub (port 8787; never sends email)
  --foreground     Keep this process in the foreground until Ctrl-C
  --docker         Use docker compose -f docker-compose.fonio-local.yml instead of Node

This is a claims-safe local demo of the website→receptionist *shape*.
It is not production Fonio-parity, not a live phone, and not App Platform.
EOF
}

mkdir -p "$RUN_DIR"

WITH_DASHBOARD=1
WITH_FORM_STUB=0
FOREGROUND=0
USE_DOCKER=0

parse_options() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --no-dashboard) WITH_DASHBOARD=0 ;;
      --dashboard) WITH_DASHBOARD=1 ;;
      --form-stub) WITH_FORM_STUB=1 ;;
      --foreground) FOREGROUND=1 ;;
      --docker) USE_DOCKER=1 ;;
      -h|--help) usage; exit 0 ;;
      *)
        echo "Unknown option: $1" >&2
        usage >&2
        exit 2
        ;;
    esac
    shift
  done
}

load_companion_env() {
  if [[ -f "$ENV_FILE" ]]; then
    while IFS='=' read -r key value; do
      case "$key" in
        ONBOARDING_* | CALENDAR_* | SANDBOX_* | CUSTOMER_DASHBOARD_* | FORM_STUB_*)
          export "$key=$value"
          ;;
      esac
    done < <(grep -E '^(ONBOARDING_|CALENDAR_|SANDBOX_|CUSTOMER_DASHBOARD_|FORM_STUB_)' "$ENV_FILE" || true)
  fi
  export ONBOARDING_WEB_INGEST="${ONBOARDING_WEB_INGEST:-true}"
  export ONBOARDING_SCAN_HOST="${ONBOARDING_SCAN_HOST:-127.0.0.1}"
  export ONBOARDING_SCAN_PORT="${ONBOARDING_SCAN_PORT:-8788}"
  export CALENDAR_ADAPTERS_ENABLED="${CALENDAR_ADAPTERS_ENABLED:-true}"
  export CALENDAR_ADAPTER_PROVIDER="${CALENDAR_ADAPTER_PROVIDER:-mock}"
  export CALENDAR_ADAPTERS_HOST="${CALENDAR_ADAPTERS_HOST:-127.0.0.1}"
  export CALENDAR_ADAPTERS_PORT="${CALENDAR_ADAPTERS_PORT:-8789}"
  export SANDBOX_TEST_CALL_ENABLED="${SANDBOX_TEST_CALL_ENABLED:-true}"
  export ONBOARDING_SANDBOX_CALL="${ONBOARDING_SANDBOX_CALL:-true}"
  export SANDBOX_TEST_CALL_HOST="${SANDBOX_TEST_CALL_HOST:-127.0.0.1}"
  export SANDBOX_TEST_CALL_PORT="${SANDBOX_TEST_CALL_PORT:-8790}"
  export CUSTOMER_DASHBOARD_ENABLED="${CUSTOMER_DASHBOARD_ENABLED:-true}"
  export CUSTOMER_DASHBOARD_DEMO_DATA="${CUSTOMER_DASHBOARD_DEMO_DATA:-true}"
  export CUSTOMER_DASHBOARD_HOST="${CUSTOMER_DASHBOARD_HOST:-127.0.0.1}"
  export CUSTOMER_DASHBOARD_PORT="${CUSTOMER_DASHBOARD_PORT:-8791}"
  export FORM_STUB_HOST="${FORM_STUB_HOST:-127.0.0.1}"
  export FORM_STUB_PORT="${FORM_STUB_PORT:-8787}"
}

require_node() {
  if ! command -v node >/dev/null 2>&1; then
    echo "Node.js is required (22+)." >&2
    exit 1
  fi
  local major
  major="$(node -p 'process.versions.node.split(".")[0]')"
  if [[ "$major" -lt 22 ]]; then
    echo "Node.js 22+ is required for --experimental-strip-types (found $(node --version))." >&2
    exit 1
  fi
}

health_url() {
  local name="$1"
  case "$name" in
    onboarding-scan) echo "http://127.0.0.1:${ONBOARDING_SCAN_PORT:-8788}/health" ;;
    calendar-adapters) echo "http://127.0.0.1:${CALENDAR_ADAPTERS_PORT:-8789}/health" ;;
    sandbox-test-call) echo "http://127.0.0.1:${SANDBOX_TEST_CALL_PORT:-8790}/health" ;;
    customer-dashboard) echo "http://127.0.0.1:${CUSTOMER_DASHBOARD_PORT:-8791}/health" ;;
    form-stub) echo "http://127.0.0.1:${FORM_STUB_PORT:-8787}/health" ;;
    *) return 1 ;;
  esac
}

pid_file() {
  echo "$RUN_DIR/$1.pid"
}

log_file() {
  echo "$RUN_DIR/$1.log"
}

is_pid_running() {
  local pid="$1"
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

wait_for_health() {
  local name="$1"
  local url
  url="$(health_url "$name")"
  local i
  for i in $(seq 1 40); do
    if node -e "fetch(process.argv[1],{signal:AbortSignal.timeout(1500)}).then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" "$url"; then
      return 0
    fi
    sleep 0.25
  done
  echo "Timed out waiting for $name at $url" >&2
  return 1
}

start_node_service() {
  local name="$1"
  shift
  local pidf logf
  pidf="$(pid_file "$name")"
  logf="$(log_file "$name")"
  if [[ -f "$pidf" ]] && is_pid_running "$(cat "$pidf")"; then
    echo "already running: $name (pid $(cat "$pidf"))"
    return 0
  fi
  (
    cd "$ROOT"
    nohup node --experimental-strip-types "$@" >"$logf" 2>&1 &
    echo $! >"$pidf"
  )
  echo "started $name (pid $(cat "$pidf")) log $logf"
}

stop_node_service() {
  local name="$1"
  local pidf
  pidf="$(pid_file "$name")"
  if [[ ! -f "$pidf" ]]; then
    return 0
  fi
  local pid
  pid="$(cat "$pidf")"
  if is_pid_running "$pid"; then
    kill "$pid" 2>/dev/null || true
    local i
    for i in $(seq 1 20); do
      is_pid_running "$pid" || break
      sleep 0.1
    done
    if is_pid_running "$pid"; then
      kill -9 "$pid" 2>/dev/null || true
    fi
    echo "stopped $name (pid $pid)"
  fi
  rm -f "$pidf"
}

compose_profiles() {
  local args=()
  if [[ "$WITH_DASHBOARD" == "1" ]]; then
    args+=(--profile dashboard)
  fi
  if [[ "$WITH_FORM_STUB" == "1" ]]; then
    args+=(--profile form-stub)
  fi
  printf '%s\n' "${args[@]}"
}

up_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "docker is not available. Omit --docker and use the Node runner." >&2
    exit 1
  fi
  local profiles=()
  while IFS= read -r line; do
    [[ -n "$line" ]] && profiles+=("$line")
  done < <(compose_profiles)
  (cd "$ROOT" && docker compose -f "$COMPOSE_FILE" "${profiles[@]}" up -d)
}

down_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    return 0
  fi
  (cd "$ROOT" && docker compose -f "$COMPOSE_FILE" --profile dashboard --profile form-stub down) || true
}

up_node() {
  require_node
  load_companion_env
  start_node_service onboarding-scan packages/onboarding-ingest/src/server.ts
  start_node_service calendar-adapters packages/calendar-adapters/src/server.ts
  start_node_service sandbox-test-call packages/sandbox-test-call/src/server.ts
  if [[ "$WITH_DASHBOARD" == "1" ]]; then
    start_node_service customer-dashboard packages/customer-dashboard/src/server.ts
  fi
  if [[ "$WITH_FORM_STUB" == "1" ]]; then
    start_node_service form-stub scripts/form-stub-server.mjs
  fi
  wait_for_health onboarding-scan
  wait_for_health calendar-adapters
  wait_for_health sandbox-test-call
  if [[ "$WITH_DASHBOARD" == "1" ]]; then
    wait_for_health customer-dashboard
  fi
  if [[ "$WITH_FORM_STUB" == "1" ]]; then
    wait_for_health form-stub
  fi
}

down_node() {
  stop_node_service onboarding-scan
  stop_node_service calendar-adapters
  stop_node_service sandbox-test-call
  stop_node_service customer-dashboard
  stop_node_service form-stub
}

print_next_hint() {
  local smoke="npm run fonio-local-smoke"
  if [[ "$WITH_DASHBOARD" != "1" && "$WITH_FORM_STUB" == "1" ]]; then
    smoke="$smoke -- --no-dashboard --form-stub"
  elif [[ "$WITH_DASHBOARD" != "1" ]]; then
    smoke="$smoke -- --no-dashboard"
  elif [[ "$WITH_FORM_STUB" == "1" ]]; then
    smoke="$smoke -- --form-stub"
  fi
  cat <<EOF

Companions are for LOCAL demo only (flags ON in this process). Frozen telephony is untouched.

Next.js (separate terminal; static export inlines NEXT_PUBLIC_* at start):
  cp .env.example.fonio-local .env.local
  npm run dev
  open http://localhost:3000/create/
  open http://localhost:3000/dashboard/   # skip if you used --no-dashboard

Smoke:
  $smoke

Runbook: docs/FONIO_LOCAL_E2E.md
EOF
}

cmd_status() {
  load_companion_env
  local name
  for name in onboarding-scan calendar-adapters sandbox-test-call customer-dashboard form-stub; do
    local pidf url extra="stopped"
    pidf="$(pid_file "$name")"
    url="$(health_url "$name")"
    if [[ -f "$pidf" ]] && is_pid_running "$(cat "$pidf")"; then
      extra="pid $(cat "$pidf")"
    fi
    local health="down"
    if node -e "fetch(process.argv[1],{signal:AbortSignal.timeout(1500)}).then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" "$url"; then
      health="up"
    fi
    printf '%-22s %-10s %s\n' "$name" "$health" "$extra  $url"
  done
}

cmd_logs() {
  local files=()
  local name
  for name in onboarding-scan calendar-adapters sandbox-test-call customer-dashboard form-stub; do
    local logf
    logf="$(log_file "$name")"
    [[ -f "$logf" ]] && files+=("$logf")
  done
  if [[ ${#files[@]} -eq 0 ]]; then
    echo "No logs in $RUN_DIR" >&2
    exit 1
  fi
  tail -n 50 -f "${files[@]}"
}

cmd="${1:-help}"
shift || true
parse_options "$@"

case "$cmd" in
  help|-h|--help)
    usage
    ;;
  up)
    if [[ "$USE_DOCKER" == "1" ]]; then
      up_docker
    else
      up_node
    fi
    print_next_hint
    smoke_args=()
    if [[ "$WITH_DASHBOARD" != "1" ]]; then
      smoke_args+=(--no-dashboard)
    fi
    if [[ "$WITH_FORM_STUB" == "1" ]]; then
      smoke_args+=(--form-stub)
    fi
    if ! node "$ROOT/scripts/fonio-local-smoke.mjs" "${smoke_args[@]+"${smoke_args[@]}"}"; then
      echo "Smoke reported FAIL. Processes were left running for debugging (\`$0 down\` to stop)." >&2
      exit 1
    fi
    if [[ "$FOREGROUND" == "1" && "$USE_DOCKER" != "1" ]]; then
      echo "Foreground mode — Ctrl-C stops the stack."
      trap 'down_node; exit 0' INT TERM
      while true; do sleep 3600; done
    fi
    ;;
  down|stop)
    if [[ "$USE_DOCKER" == "1" ]]; then
      down_docker
    fi
    down_node
    echo "Stopped local Fonio companion stack."
    ;;
  status)
    cmd_status
    ;;
  logs)
    cmd_logs
    ;;
  *)
    echo "Unknown command: $cmd" >&2
    usage >&2
    exit 2
    ;;
esac
