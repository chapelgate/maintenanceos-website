#!/usr/bin/env bash
# One-shot London voice recovery after secrets are injected.
# Loads credentials from process env and/or /tmp/mos-secrets/<NAME> files.
# Never prints secret values. Does not touch HLO / Evidence Wallet / Cheap Trips.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
SECRETS_DIR="${MOS_SECRETS_DIR:-/tmp/mos-secrets}"
mkdir -p "$SECRETS_DIR"
chmod 700 "$SECRETS_DIR" 2>/dev/null || true

load_secret() {
  local name="$1"
  if [[ -n "${!name:-}" ]]; then
    return 0
  fi
  if [[ -f "$SECRETS_DIR/$name" ]]; then
    # shellcheck disable=SC2086
    export "$name=$(<"$SECRETS_DIR/$name")"
  fi
}

for name in \
  DIGITALOCEAN_TOKEN DIGITALOCEAN_ACCESS_TOKEN DO_API_TOKEN \
  GEMINI_API_KEY GOOGLE_API_KEY \
  TWILIO_ACCOUNT_SID TWILIO_AUTH_TOKEN TWILIO_PHONE_NUMBER TWILIO_HUMAN_TRANSFER_NUMBER \
  RENDER_API_KEY APP_SECRET DATABASE_URL POSTGRES_PASSWORD PUBLIC_HOST TLS_CONTACT_EMAIL
do
  load_secret "$name" || true
done

# Prefer DIGITALOCEAN_TOKEN aliases
if [[ -z "${DIGITALOCEAN_TOKEN:-}" ]]; then
  DIGITALOCEAN_TOKEN="${DIGITALOCEAN_ACCESS_TOKEN:-${DO_API_TOKEN:-}}"
  export DIGITALOCEAN_TOKEN
fi
if [[ -z "${GEMINI_API_KEY:-}" && -n "${GOOGLE_API_KEY:-}" ]]; then
  export GEMINI_API_KEY="$GOOGLE_API_KEY"
fi

missing=()
for name in DIGITALOCEAN_TOKEN GEMINI_API_KEY TWILIO_ACCOUNT_SID TWILIO_AUTH_TOKEN TWILIO_PHONE_NUMBER TWILIO_HUMAN_TRANSFER_NUMBER; do
  if [[ -z "${!name:-}" ]]; then
    missing+=("$name")
  fi
done

if [[ ${#missing[@]} -gt 0 ]]; then
  # Optional: if RENDER_API_KEY present, pull Gemini/Twilio from Render into secrets dir
  if [[ -n "${RENDER_API_KEY:-}" && -f "$ROOT/render_inventory.py" ]]; then
    echo "Attempting Render env export (names only)..."
    python3 - <<'PY'
import os, json
from pathlib import Path
import render_inventory as ri
out = Path(os.environ.get("MOS_SECRETS_DIR", "/tmp/mos-secrets"))
out.mkdir(mode=0o700, exist_ok=True)
wanted = [
  "GEMINI_API_KEY", "GOOGLE_API_KEY",
  "TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER", "TWILIO_HUMAN_TRANSFER_NUMBER",
  "APP_SECRET", "DIGITALOCEAN_TOKEN", "DO_API_TOKEN", "DIGITALOCEAN_ACCESS_TOKEN",
]
recovered = []
with ri.RenderClient(os.environ["RENDER_API_KEY"]) as client:
    target = None
    for svc in client.services():
        if svc.get("name") == "maintenanceos-redteam-v2" or svc.get("id") == "srv-dahhskafngtc739pnplg":
            target = svc
            break
    if target is None:
        # fallback by id from docs
        target = client.service("srv-dahhskafngtc739pnplg")
    if not target:
        raise SystemExit("RENDER_TARGET_NOT_FOUND")
    env = client.env_vars(target["id"])
    for k in wanted:
        v = (env.get(k) or "").strip()
        if not v:
            continue
        p = out / k
        p.write_text(v)
        p.chmod(0o600)
        os.environ[k] = v
        recovered.append(k)
print(json.dumps({"render_export_ok": True, "recovered_names": recovered}, sort_keys=True))
PY
    for name in DIGITALOCEAN_TOKEN GEMINI_API_KEY TWILIO_ACCOUNT_SID TWILIO_AUTH_TOKEN TWILIO_PHONE_NUMBER TWILIO_HUMAN_TRANSFER_NUMBER; do
      load_secret "$name" || true
    done
    if [[ -z "${DIGITALOCEAN_TOKEN:-}" ]]; then
      DIGITALOCEAN_TOKEN="${DIGITALOCEAN_ACCESS_TOKEN:-${DO_API_TOKEN:-}}"
      export DIGITALOCEAN_TOKEN
    fi
    if [[ -z "${GEMINI_API_KEY:-}" && -n "${GOOGLE_API_KEY:-}" ]]; then
      export GEMINI_API_KEY="$GOOGLE_API_KEY"
    fi
    missing=()
    for name in DIGITALOCEAN_TOKEN GEMINI_API_KEY TWILIO_ACCOUNT_SID TWILIO_AUTH_TOKEN TWILIO_PHONE_NUMBER TWILIO_HUMAN_TRANSFER_NUMBER; do
      [[ -z "${!name:-}" ]] && missing+=("$name")
    done
  fi
fi

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "MISSING_SECRETS:${missing[*]}"
  echo "Inject the missing secrets into this Cloud Agent environment (or as files under $SECRETS_DIR), then re-run:"
  echo "  ./scripts/run_london_voice_recovery.sh"
  exit 2
fi

export MOS_DEPLOY_SHA="$(git rev-parse HEAD)"
export MOS_DEPLOY_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
export TWILIO_TEST_NUMBER_CONFIRMED=true
export VERIFY_TWILIO_SIGNATURES=true
export VOICE_PROVIDER=gemini
export ENABLE_PUBLIC_PROVIDER_INGRESS=true
export ENABLE_REALTIME_VOICE=true
export APP_SECRET="${APP_SECRET:-$(openssl rand -hex 32)}"
export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-$(openssl rand -hex 24)}"
export TLS_CONTACT_EMAIL="${TLS_CONTACT_EMAIL:-chaplegate@gmail.com}"

MODE="${MOS_VOICE_MODE:-auto}"
# auto: App Platform if no PUBLIC_HOST; droplet if PUBLIC_HOST set
if [[ "$MODE" == "auto" ]]; then
  if [[ -n "${PUBLIC_HOST:-}" ]]; then MODE=droplet; else MODE=app; fi
fi

echo "MODE=$MODE SHA=$MOS_DEPLOY_SHA"

if [[ "$MODE" == "app" ]]; then
  # App Platform needs a DATABASE_URL; use ephemeral managed SQLite alternative via container local if unset
  if [[ -z "${DATABASE_URL:-}" ]]; then
    export DATABASE_URL="sqlite:////tmp/maintenanceos-voice.db"
    export DATABASE_DEPLOYMENT_MODE=local
    export DATABASE_TLS_REQUIRED=false
  fi
  python3 scripts/provision_do_voice_app.py | tee /tmp/mos-secrets/provision-app.json
  BASE_URL=$(python3 -c 'import json;print(json.load(open("/tmp/mos-secrets/provision-app.json")).get("live_url",""))')
  if [[ -z "$BASE_URL" ]]; then
    echo "APP_URL_MISSING"
    exit 3
  fi
  export PUBLIC_BASE_URL="$BASE_URL"
  echo "Waiting for App Platform health..."
  for _ in $(seq 1 60); do
    if curl -fsS "$PUBLIC_BASE_URL/health" >/tmp/mos-secrets/health.json 2>/dev/null; then
      break
    fi
    sleep 10
  done
else
  python3 scripts/provision_do_voice_droplet.py | tee /tmp/mos-secrets/provision-droplet.json
  DROPLET_IP=$(python3 -c 'import json;print(json.load(open("/tmp/mos-secrets/provision-droplet.json")).get("ip",""))')
  export DROPLET_IP
  if [[ -z "${PUBLIC_HOST:-}" ]]; then
    echo "PUBLIC_HOST required for droplet TLS"
    exit 4
  fi
  ./scripts/deploy_voice_droplet.sh
  export PUBLIC_BASE_URL="https://${PUBLIC_HOST}"
fi

echo "Running transport gates..."
python3 scripts/voice_transport_gates.py --base-url "$PUBLIC_BASE_URL" | tee /tmp/mos-secrets/gates.json

echo "Configuring dedicated TEST Twilio number only..."
python3 - <<'PY'
from provider_webhooks import configure_twilio_voice_webhook, apply_twilio_incoming_phone_voice_url
import json, os
os.environ["ENABLE_PUBLIC_PROVIDER_INGRESS"] = "true"
os.environ["VERIFY_TWILIO_SIGNATURES"] = "true"
os.environ["TWILIO_TEST_NUMBER_CONFIRMED"] = "true"
result = configure_twilio_voice_webhook(twilio_updater=apply_twilio_incoming_phone_voice_url)
print(json.dumps({k: result[k] for k in result if k != "message"}, sort_keys=True))
if not result.get("mutated") and not result.get("should_skip_closed_mode"):
  raise SystemExit(5)
PY

echo "ROLLBACK_RENDER=https://maintenanceos-redteam-v2.onrender.com"
echo "PUBLIC_BASE_URL=$PUBLIC_BASE_URL"
python3 - <<'PY'
import json
from pathlib import Path
gates=json.loads(Path('/tmp/mos-secrets/gates.json').read_text())
print(json.dumps({"gates_ok": gates.get("ok"), "gate_count": len(gates.get("gates",[]))}, sort_keys=True))
if not gates.get("ok"):
  raise SystemExit(6)
print("READY_FOR_TEST_CALL_CANDIDATE")
PY
