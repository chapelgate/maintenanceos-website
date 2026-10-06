#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "WAVE1_SUT_BASE_SHA=73f0cb353b9d051532190de93a7c9101f835d03c"
echo "WAVE1_HARNESS_SHA=${GIT_COMMIT_SHA:-bundle}"

STAGE_JOB="$(sbatch --parsable hpc/lumi/wave1_stage.slurm)"
ARRAY_JOB="$(sbatch --parsable --dependency=afterok:$STAGE_JOB hpc/lumi/wave1_model_array.slurm)"
SUMMARY_JOB="$(sbatch --parsable --dependency=afterany:$ARRAY_JOB --export=ALL,WAVE1_ARRAY_JOB_ID=$ARRAY_JOB hpc/lumi/wave1_summary.slurm)"

echo "WAVE1_STAGE_JOB=$STAGE_JOB"
echo "WAVE1_ARRAY_JOB=$ARRAY_JOB"
echo "WAVE1_SUMMARY_JOB=$SUMMARY_JOB"
echo "WAVE1_MAX_GPU_HOURS_IF_ALL_ARRAY_TASKS_HIT_45_MIN=2.25"
echo "WAVE1_LAPTOP_REQUIRED_AFTER_SUBMIT=NO"
echo "WAVE1_SUBMISSION=COMPLETE"
