#!/bin/bash -l
#SBATCH --job-name=mos-lumi-bench
#SBATCH --output=lumi-bench-%j.out
#SBATCH --error=lumi-bench-%j.err
#SBATCH --partition=small-g
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=7
#SBATCH --gpus=1
#SBATCH --time=01:00:00

set -euo pipefail

: "${BENCHMARK_CMD:?Set BENCHMARK_CMD to a synthetic MaintenanceOS benchmark command}"
: "${LUMI_ACTIVATION_OK:?Set LUMI_ACTIVATION_OK only after smoke PASS, allocation evidence and synthetic corpus freeze}"
test "$LUMI_ACTIVATION_OK" = "YES"

ROOT="${SLURM_SUBMIT_DIR:-$PWD}"
cd "$ROOT"
mkdir -p artifacts/eurohpc

META="artifacts/eurohpc/job-${SLURM_JOB_ID}.meta.txt"
{
  echo "utc_start=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "job_id=${SLURM_JOB_ID}"
  echo "partition=${SLURM_JOB_PARTITION:-unknown}"
  echo "nodes=${SLURM_JOB_NUM_NODES:-unknown}"
  echo "commit=${GIT_COMMIT_SHA:-$(git rev-parse HEAD 2>/dev/null || echo unknown)}"
  echo "benchmark_cmd=${BENCHMARK_CMD}"
  echo "--- allocation_before ---"
  lumi-allocations || true
} > "$META"

srun --ntasks=1 --gpus-per-task=1 bash -lc "$BENCHMARK_CMD"

{
  echo "utc_end=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "--- allocation_after ---"
  lumi-allocations || true
} >> "$META"