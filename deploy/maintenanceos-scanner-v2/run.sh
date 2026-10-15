#!/bin/sh
# Run the Scanner V2 companion as uid 1000 with the host state directory
# mounted at /data. The Playwright base image has no node account.
# The process user is 1000:1000. State is SCANNER_V2_STATE_ROOT.
set -eu

IMAGE="${IMAGE:-mos-onboarding-scan}"
NAME="${NAME:-mos-onboarding-scan}"
DATA_DIR="${DATA_DIR:-/var/lib/maintenanceos-scanner-v2}"
PORT="${PORT:-8788}"

if [ "$(id -u)" -eq 0 ]; then
  install -d -o 1000 -g 1000 -m 0755 "$DATA_DIR"
else
  mkdir -p "$DATA_DIR"
fi

docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d --name "$NAME" --restart unless-stopped \
  --user 1000:1000 \
  -p "127.0.0.1:${PORT}:8788" \
  -v "${DATA_DIR}:/data" \
  -e PORT=8788 \
  -e ONBOARDING_SCAN_HOST=0.0.0.0 \
  -e ONBOARDING_WEB_INGEST="${ONBOARDING_WEB_INGEST:-false}" \
  -e ONBOARDING_SCANNER_V2="${ONBOARDING_SCANNER_V2:-true}" \
  -e SCANNER_V2_STATE_ROOT=/data \
  -e SCANNER_V2_RELEASE_SHA="${RELEASE_SHA:-local}" \
  "$IMAGE"
