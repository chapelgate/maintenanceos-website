#!/bin/bash
set -euo pipefail

PROJECT="project_465003507"
ROOT="/scratch/$PROJECT"
MODEL_ROOT="$ROOT/models"
HF_HOME="$ROOT/hf-cache"
SIF="/appl/local/laifs/containers/lumi-multitorch-latest.sif"

module purge
module load Local-LAIF lumi-aif-singularity-bindings
mkdir -p "$MODEL_ROOT" "$HF_HOME"

candidates=(
  "qwen3-8b|Qwen/Qwen3-8B"
  "qwen3-14b|Qwen/Qwen3-14B"
  "phi-4|microsoft/phi-4"
  "mistral-small-3.1-24b|mistralai/Mistral-Small-3.1-24B-Instruct-2503"
  "qwen3-30b-a3b-instruct|Qwen/Qwen3-30B-A3B-Instruct-2507"
  "gpt-oss-20b|openai/gpt-oss-20b"
)

for item in "${candidates[@]}"; do
  id="${item%%|*}"
  repo="${item#*|}"
  dest="$MODEL_ROOT/$id"
  mkdir -p "$dest"
  if [ -f "$dest/config.json" ]; then
    echo "STAGED $id $(du -sh "$dest" | awk '{print $1}')"
    continue
  fi
  echo "STAGE_START $id $repo"
  SINGULARITYENV_HF_HOME="$HF_HOME" singularity run "$SIF" python - "$repo" "$dest" <<'PY'
from huggingface_hub import snapshot_download
import sys
repo, dest = sys.argv[1], sys.argv[2]
print(snapshot_download(repo_id=repo, local_dir=dest))
PY
  test -f "$dest/config.json"
  echo "STAGE_PASS $id $(du -sh "$dest" | awk '{print $1}')"
done

echo "WAVE1_MODEL_STAGE=PASS"
