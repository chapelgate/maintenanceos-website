#!/bin/bash -l
#SBATCH --job-name=mos-wave1-summary
#SBATCH --output=wave1-summary-%j.out
#SBATCH --error=wave1-summary-%j.err
#SBATCH --account=project_465003507
#SBATCH --partition=small
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=1
#SBATCH --time=00:10:00

set -euo pipefail
: "${WAVE1_ARRAY_JOB_ID:?WAVE1_ARRAY_JOB_ID is required}"

ROOT="${SLURM_SUBMIT_DIR:-$PWD}"
cd "$ROOT"
OUTDIR="$ROOT/artifacts/eurohpc/wave1"
mkdir -p "$OUTDIR"

SACCT="$OUTDIR/sacct-$WAVE1_ARRAY_JOB_ID.txt"
sacct -j "$WAVE1_ARRAY_JOB_ID"   --format=JobIDRaw,JobName,Partition,State,ElapsedRaw,AllocTRES -P > "$SACCT"

python3 "$ROOT/scripts/lumi_wave1_accounting.py"   --out "$OUTDIR/accounting-$WAVE1_ARRAY_JOB_ID.json" < "$SACCT"

python3 - "$OUTDIR" "$WAVE1_ARRAY_JOB_ID" <<'PY'
import glob,json,os,sys
root, array_job = sys.argv[1], sys.argv[2]
rows=[]
for model_dir in sorted(glob.glob(os.path.join(root,"*"))):
    if not os.path.isdir(model_dir):
        continue
    model=os.path.basename(model_dir)
    reports=sorted(glob.glob(os.path.join(model_dir,"report-*.json")))
    metas=sorted(glob.glob(os.path.join(model_dir,"meta-*.txt")))
    status="NO_RESULT"
    summary=None
    if reports:
        r=json.load(open(reports[-1],encoding="utf-8"))
        summary=r.get("summary")
        status="P1_HARD_PASS" if r.get("passed") else "P1_HARD_FAIL"
    rows.append({"model_id":model,"status":status,"summary":summary,"meta_files":metas})
out={"array_job_id":array_job,"candidates":rows}
path=os.path.join(root,f"wave1-summary-{array_job}.json")
open(path,"w",encoding="utf-8").write(json.dumps(out,indent=2,sort_keys=True)+"\n")
print(json.dumps(out,indent=2,sort_keys=True))
PY

echo "WAVE1_SUMMARY_COMPLETE=$WAVE1_ARRAY_JOB_ID"
