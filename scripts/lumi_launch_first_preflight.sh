#!/bin/bash
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

MODEL_ID="qwen3-8b"
MODEL_REPO="Qwen/Qwen3-8B"
MODEL_PATH="/scratch/project_465003507/models/qwen3-8b"

if [ ! -f "$MODEL_PATH/config.json" ]; then
  scripts/lumi_stage_model.sh "$MODEL_REPO" "$MODEL_ID"
fi

export MODEL_ID MODEL_PATH
JOB_ID="$(sbatch --parsable hpc/lumi/model_preflight_v2.slurm)"
echo "submitted_model=$MODEL_ID"
echo "job_id=$JOB_ID"
echo "check_with=squeue -j $JOB_ID"
echo "after_completion=cat lumi-v2-preflight-$JOB_ID.out"
