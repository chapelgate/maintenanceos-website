#!/bin/bash
set -euo pipefail

: "${1:?Usage: scripts/lumi_stage_model.sh <huggingface-repo> <directory-name>}"
: "${2:?Usage: scripts/lumi_stage_model.sh <huggingface-repo> <directory-name>}"

MODEL_REPO="$1"
DIRNAME="$2"
PROJECT="project_465003507"
BASE="/scratch/$PROJECT"
MODEL_DIR="$BASE/models/$DIRNAME"
HF_HOME="$BASE/hf-cache"
SIF="/appl/local/laifs/containers/lumi-multitorch-latest.sif"

mkdir -p "$MODEL_DIR" "$HF_HOME"
module load Local-LAIF lumi-aif-singularity-bindings

echo "Staging $MODEL_REPO -> $MODEL_DIR"
echo "No GPU allocation is requested by this download step."

SINGULARITYENV_HF_HOME="$HF_HOME" singularity run "$SIF" python - "$MODEL_REPO" "$MODEL_DIR" <<'PY'
from huggingface_hub import snapshot_download
import sys
repo, local_dir = sys.argv[1], sys.argv[2]
path = snapshot_download(
    repo_id=repo,
    local_dir=local_dir,
    local_dir_use_symlinks=False,
)
print(path)
PY

find "$MODEL_DIR" -maxdepth 1 -type f -printf '%f\n' | sort
du -sh "$MODEL_DIR"
