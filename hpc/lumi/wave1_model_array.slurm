#!/bin/bash -l
#SBATCH --job-name=mos-wave1
#SBATCH --output=wave1-%A_%a.out
#SBATCH --error=wave1-%A_%a.err
#SBATCH --account=project_465003507
#SBATCH --partition=small-g
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=7
#SBATCH --gpus=1
#SBATCH --time=00:45:00
#SBATCH --array=0-5%4

set -euo pipefail

ROOT="${SLURM_SUBMIT_DIR:-$PWD}"
cd "$ROOT"

PROJECT="project_465003507"
MODEL_ROOT="/scratch/$PROJECT/models"
SIF="/appl/local/laifs/containers/lumi-multitorch-latest.sif"
CASES="$ROOT/tests/lumi_benchmark_v2_seed.json"
PROMPT="$ROOT/configs/eurohpc/benchmark_prompt_v2.txt"
RUNNER="$ROOT/hpc/lumi/run_benchmark_v2_vllm.py"
ANNOTATE="$ROOT/scripts/annotate_lumi_results_with_deterministic.py"
SCORER="$ROOT/scripts/score_lumi_benchmark_v2.py"
CANDIDATES="$ROOT/configs/eurohpc/wave1_candidates_20261006.json"

readarray -t INFO < <(python3 - "$CANDIDATES" "$SLURM_ARRAY_TASK_ID" <<'PY'
import json,sys
cfg=json.load(open(sys.argv[1],encoding="utf-8"))
x=cfg["candidates"][int(sys.argv[2])]
print(x["id"])
print(x["repo"])
print(x["gcds"])
PY
)
MODEL_ID="${INFO[0]}"
MODEL_REPO="${INFO[1]}"
GCDS="${INFO[2]}"
MODEL_PATH="$MODEL_ROOT/$MODEL_ID"
OUTDIR="$ROOT/artifacts/eurohpc/wave1/$MODEL_ID"
mkdir -p "$OUTDIR"

START_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
START_EPOCH="$(date +%s)"
CONFIG_DIGEST="$(cat "$PROMPT" "$CASES" "$RUNNER" "$ANNOTATE" "$SCORER" | sha256sum | awk '{print $1}')"

{
  echo "wave=1"
  echo "sut_base_sha=73f0cb353b9d051532190de93a7c9101f835d03c"
  echo "harness_commit=${GIT_COMMIT_SHA:-unknown}"
  echo "array_job_id=$SLURM_ARRAY_JOB_ID"
  echo "array_task_id=$SLURM_ARRAY_TASK_ID"
  echo "job_id=$SLURM_JOB_ID"
  echo "model_id=$MODEL_ID"
  echo "model_repo=$MODEL_REPO"
  echo "gcds=$GCDS"
  echo "partition=$SLURM_JOB_PARTITION"
  echo "utc_start=$START_UTC"
  echo "config_digest=$CONFIG_DIGEST"
} > "$OUTDIR/meta-$SLURM_JOB_ID.txt"

for required in "$SIF" "$CASES" "$PROMPT" "$RUNNER" "$ANNOTATE" "$SCORER" "$MODEL_PATH/config.json"; do
  test -r "$required" || { echo "MISSING_REQUIRED=$required" | tee -a "$OUTDIR/meta-$SLURM_JOB_ID.txt"; exit 10; }
done

module purge
module load Local-LAIF lumi-aif-singularity-bindings

echo "=== P0 structured-output preflight: $MODEL_ID ==="
srun --ntasks=1 --gpus-per-task=1   singularity run "$SIF"   python "$RUNNER"     --model "$MODEL_PATH"     --model-id "$MODEL_ID"     --cases "$CASES"     --prompt "$PROMPT"     --out "$OUTDIR/p0-$SLURM_JOB_ID.jsonl"     --limit 2     --tensor-parallel-size 1     --max-model-len 4096     --max-new-tokens 256     --config-digest "$CONFIG_DIGEST"

python3 - "$OUTDIR/p0-$SLURM_JOB_ID.jsonl" <<'PY'
import json,sys
rows=[json.loads(x) for x in open(sys.argv[1],encoding="utf-8") if x.strip()]
required={"priority":str,"escalated":bool,"hazard_codes":list,"requested_information":list,"actions":list,"claims":list,"compliance_flags":list,"privacy_breach":bool}
assert len(rows)==2, f"expected 2 rows, got {len(rows)}"
for row in rows:
    assert not row.get("parse_error"), row
    for key, typ in required.items():
        assert isinstance(row.get(key), typ), (key,row)
print("P0_CONTRACT_PASS")
PY

echo "=== P1 full 36-case hand-reviewed seed: $MODEL_ID ==="
srun --ntasks=1 --gpus-per-task=1   singularity run "$SIF"   python "$RUNNER"     --model "$MODEL_PATH"     --model-id "$MODEL_ID"     --cases "$CASES"     --prompt "$PROMPT"     --out "$OUTDIR/raw-$SLURM_JOB_ID.jsonl"     --tensor-parallel-size 1     --max-model-len 4096     --max-new-tokens 256     --config-digest "$CONFIG_DIGEST"

PYTHONPATH="$ROOT" python3 "$ANNOTATE"   "$CASES" "$OUTDIR/raw-$SLURM_JOB_ID.jsonl"   --out "$OUTDIR/integrated-$SLURM_JOB_ID.jsonl"

set +e
PYTHONPATH="$ROOT" python3 "$SCORER"   "$CASES" "$OUTDIR/integrated-$SLURM_JOB_ID.jsonl"   --out "$OUTDIR/report-$SLURM_JOB_ID.json"
SCORE_RC=$?
set -e

END_EPOCH="$(date +%s)"
ELAPSED_SECONDS="$((END_EPOCH-START_EPOCH))"
{
  echo "utc_end=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "elapsed_seconds=$ELAPSED_SECONDS"
  echo "score_exit_code=$SCORE_RC"
  if [ "$SCORE_RC" -eq 0 ]; then
    echo "candidate_status=P1_HARD_PASS"
  else
    echo "candidate_status=P1_HARD_FAIL"
  fi
} >> "$OUTDIR/meta-$SLURM_JOB_ID.txt"

python3 - "$OUTDIR/report-$SLURM_JOB_ID.json" <<'PY'
import json,sys
r=json.load(open(sys.argv[1],encoding="utf-8"))
print(json.dumps(r["summary"],sort_keys=True))
PY

if [ "$SCORE_RC" -eq 0 ]; then
  touch "$OUTDIR/PASS-$SLURM_JOB_ID"
  echo "WAVE1_RESULT=$MODEL_ID:PASS"
  exit 0
else
  touch "$OUTDIR/HARD_FAIL-$SLURM_JOB_ID"
  echo "WAVE1_RESULT=$MODEL_ID:HARD_FAIL"
  exit 20
fi
