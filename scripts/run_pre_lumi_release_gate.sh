#!/usr/bin/env bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

echo "PRE_LUMI_RELEASE_GATE"
echo "commit=$(git rev-parse HEAD)"
echo "utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"

python -m py_compile   scripts/validate_lumi_benchmark_v2.py   scripts/score_lumi_benchmark_v2.py   scripts/select_lumi_benchmark_shard_v2.py   scripts/annotate_lumi_results_with_deterministic.py   hpc/lumi/run_benchmark_v2_vllm.py   awaab_policy.py

python scripts/validate_lumi_benchmark_v2.py tests/lumi_benchmark_v2_seed.json >/tmp/lumi-v2-integrity.json

python -m pytest -q   tests/test_awaab_policy.py   tests/test_lifecycle_integrity.py   tests/test_identity.py   tests/test_tenant_isolation_extended.py   tests/test_gemini_voice_policy.py   tests/test_backup_restore.py   tests/test_security_stdlib.py   tests/test_lumi_benchmark_v2_integrity.py   tests/test_lumi_benchmark_v2_registry.py   tests/test_lumi_benchmark_v2_selector.py   tests/test_lumi_benchmark_v2_scoring.py   tests/test_lumi_benchmark_v2_deterministic_overlay.py   tests/test_lumi_benchmark_v2_model_candidates.py   tests/test_lumi_release_program_integration.py

echo "PRE_LUMI_RELEASE_GATE_PASS"
