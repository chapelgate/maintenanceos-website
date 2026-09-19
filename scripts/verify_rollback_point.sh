#!/usr/bin/env bash
# Prove rollback point exists and is reachable without mutating working tree.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
BASELINE="${1:-}"
if [[ -z "$BASELINE" ]]; then
  BASELINE="$(python3 -c "import json; print(json.load(open('docs/concurrency_100_evidence/evidence-pack.json'))['baseline_main_sha'])")"
fi
git cat-file -e "${BASELINE}^{commit}"
echo "ROLLBACK_POINT_OK ${BASELINE}"
git merge-base --is-ancestor "$BASELINE" HEAD || git merge-base --is-ancestor "$BASELINE" origin/main
echo "ROLLBACK_ANCESTRY_OK"
echo "To roll back production: checkout main @ ${BASELINE} and redeploy prior Render/cloud-workers SHA."
