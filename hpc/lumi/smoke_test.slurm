#!/bin/bash -l
#SBATCH --job-name=mos-lumi-smoke
#SBATCH --output=lumi-smoke-%j.out
#SBATCH --error=lumi-smoke-%j.err
#SBATCH --partition=small-g
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=7
#SBATCH --gpus=1
#SBATCH --time=00:10:00

set -euo pipefail

ROOT="${SLURM_SUBMIT_DIR:-$PWD}"
cd "$ROOT"
mkdir -p artifacts/eurohpc

echo "=== MaintenanceOS LUMI-G smoke test ==="
echo "utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "job_id=${SLURM_JOB_ID:-unknown}"
echo "node=$(hostname)"
echo "commit=${GIT_COMMIT_SHA:-$(git rev-parse HEAD 2>/dev/null || echo unknown)}"

echo "--- allocation visibility ---"
command -v lumi-allocations >/dev/null
lumi-allocations

echo "--- accelerator visibility ---"
if command -v rocm-smi >/dev/null 2>&1; then
  rocm-smi --showproductname || true
fi

SIF="${LUMI_AI_SIF:-/appl/local/laifs/containers/lumi-multitorch-latest.sif}"
test -r "$SIF"
command -v singularity >/dev/null

srun --ntasks=1 --gpus-per-task=1 singularity run "$SIF" python -c 'import torch; assert torch.cuda.is_available(), "torch accelerator unavailable"; n=torch.cuda.device_count(); assert n >= 1, n; print("torch_gpu_count=", n); print("device0=", torch.cuda.get_device_name(0))'

PASS="artifacts/eurohpc/smoke-${SLURM_JOB_ID}.pass"
printf 'job_id=%s\nutc=%s\n' "$SLURM_JOB_ID" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$PASS"
echo "SMOKE_TEST_PASS $PASS"