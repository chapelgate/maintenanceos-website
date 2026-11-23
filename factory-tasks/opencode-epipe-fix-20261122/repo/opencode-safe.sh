#!/bin/bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GUARD="$HERE/epipe-guard.cjs"
export NODE_OPTIONS="--require $GUARD${NODE_OPTIONS:+ $NODE_OPTIONS}"
exec /home/andy/.opencode/bin/opencode "$@"
