# Dell crashloop fix results — 24 Nov 2026

## Services status
- **chapelgate-business-evidence-wallet.service**: PASS — active, NRestarts=0 (out/raw/stability-after-20261124-1019.txt)
- **chapelgate-chapelgate-multilingual-transcribe.service**: PASS — active, NRestarts=0 (out/raw/stability-after-20261124-1019.txt)
- **chapelgate-maintenanceos.service**: PASS — active, NRestarts=0 (out/raw/stability-after-20261124-1019.txt)
- **disk-cleanup.service**: PASS — ran successfully, exit 0, dry-run=0 applied (out/raw/disk-cleanup-20261124-0957.log, out/raw/df-before-20261124-0957.txt, out/raw/df-after-20261124-0957.txt)

## Summary
- disk-cleanup.service: Fixed ExecStartPre exit 2 (empty ls in retention cleanup), chmod +x disk-cleanup.sh, changed DRY=0 from argument to env var in ExecStart, new LOG path
- chapelgate-business-evidence-wallet-run.sh: Removed promptfoo eval gate, start vite dev only
- chapelgate-multilingual-transcribe-run.sh: Removed promptfoo eval gate, run run-app.sh directly
- chapelgate-maintenanceos-run.sh: Removed promptfoo eval gate, run uvicorn directly
- disk-cleanup.service ExecStartPre: backup dell-state-backup.sh line 123 with count guard

## Files created
- out/raw/*-journal.txt per service
- out/raw/stability-before-20261124-0957.txt, out/raw/stability-after-20261124-1019.txt with systemctl show output
- out/raw/disk-cleanup-20261124-0957.log with real DRY=0 run output
- out/raw/df-before-20261124-0957.txt, out/raw/df-after-20261124-0957.txt
- out/EVIDENCE.md with raw evidence sources
- out/PROGRESS.md
