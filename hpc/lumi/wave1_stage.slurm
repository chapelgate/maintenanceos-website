#!/bin/bash -l
#SBATCH --job-name=mos-wave1-stage
#SBATCH --output=wave1-stage-%j.out
#SBATCH --error=wave1-stage-%j.err
#SBATCH --account=project_465003507
#SBATCH --partition=small
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=2
#SBATCH --time=04:00:00

set -euo pipefail
ROOT="${SLURM_SUBMIT_DIR:-$PWD}"
cd "$ROOT"

echo "WAVE1_STAGE_START $(date -u +%Y-%m-%dT%H:%M:%SZ)"
bash "$ROOT/scripts/lumi_stage_wave1_models.sh"
echo "WAVE1_STAGE_END $(date -u +%Y-%m-%dT%H:%M:%SZ)"
