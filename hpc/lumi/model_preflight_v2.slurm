#!/bin/bash -l
#SBATCH --job-name=mos-v2-preflight
#SBATCH --output=lumi-v2-preflight-%j.out
#SBATCH --error=lumi-v2-preflight-%j.err
#SBATCH --account=project_465003507
#SBATCH --partition=small-g
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=7
#SBATCH --gpus=1
#SBATCH --time=00:30:00

set -euo pipefail

: "${MODEL_PATH:?Set MODEL_PATH to a model directory already staged on LUMI}"
: "${MODEL_ID:?Set MODEL_ID to the candidate id from configs/eurohpc/model_candidates_v2.json}"

ROOT="${SLURM_SUBMIT_DIR:-$PWD}"
cd "$ROOT"

CASES="${CASES:-tests/lumi_benchmark_v2_seed.json}"
PROMPT="${PROMPT:-configs/eurohpc/benchmark_prompt_v2.txt}"
SIF="${SIF:-/appl/local/laifs/containers/lumi-multitorch-latest.sif}"
OUTDIR="artifacts/eurohpc/preflight/$MODEL_ID"
mkdir -p "$OUTDIR"

test -r "$CASES"
test -r "$PROMPT"
test -r "$SIF"
test -d "$MODEL_PATH"

module purge
module load Local-LAIF lumi-aif-singularity-bindings

CONFIG_DIGEST="$(
  cat "$PROMPT" "$CASES" hpc/lumi/run_benchmark_v2_vllm.py   | sha256sum | awk '{print $1}'
)"

{
  echo "utc_start=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "job_id=$SLURM_JOB_ID"
  echo "model_id=$MODEL_ID"
  echo "model_path=$MODEL_PATH"
  echo "config_digest=$CONFIG_DIGEST"
  echo "--- allocation_before ---"
  lumi-allocations || true
} > "$OUTDIR/meta-$SLURM_JOB_ID.txt"

srun --ntasks=1 --gpus-per-task=1   singularity run "$SIF"   python "$ROOT/hpc/lumi/run_benchmark_v2_vllm.py"     --model "$MODEL_PATH"     --model-id "$MODEL_ID"     --cases "$ROOT/$CASES"     --prompt "$ROOT/$PROMPT"     --out "$ROOT/$OUTDIR/results-$SLURM_JOB_ID.jsonl"     --limit 2     --tensor-parallel-size 1     --max-model-len 4096     --max-new-tokens 256     --config-digest "$CONFIG_DIGEST"

python3 - "$OUTDIR/results-$SLURM_JOB_ID.jsonl" <<'PY'
import json, sys
path=sys.argv[1]
rows=[json.loads(x) for x in open(path, encoding="utf-8") if x.strip()]
required={"priority":str,"escalated":bool,"hazard_codes":list,"requested_information":list,"actions":list,"claims":list,"privacy_breach":bool}
assert len(rows)==2, f"expected 2 rows, got {len(rows)}"
for row in rows:
    assert not row.get("parse_error"), row
    for key, typ in required.items():
        assert isinstance(row.get(key), typ), (key, row)
print("PREFLIGHT_PASS")
PY

{
  echo "utc_end=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "status=PASS"
  echo "--- allocation_after ---"
  lumi-allocations || true
} >> "$OUTDIR/meta-$SLURM_JOB_ID.txt"

touch "$OUTDIR/PASS-$SLURM_JOB_ID"
