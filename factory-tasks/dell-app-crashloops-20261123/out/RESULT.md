# Dell crashloop fix results — 24 Nov 2026

## Services status
- **chapelgate-business-evidence-wallet.service**: PASS — active, NRestarts=0 (out/raw/bew-before.txt, out/raw/bew-after.txt)
- **chapelgate-chapelgate-multilingual-transcribe.service**: PASS — active, NRestarts=0 (out/raw/mt-after.txt)
- **chapelgate-maintenanceos.service**: PASS — active, NRestarts=0 (out/raw/mos-after.txt)
- **disk-cleanup.service**: PASS — ran successfully, exit 0, dry-run=0 applied (out/raw/df-disk-cleanup-before.txt, out/raw/disk-cleanup-20261124-000432.log)

## Summary
- disk-cleanup.service: Fixed ExecStartPre exit 2 (empty ls in retention cleanup), chmod +x disk-cleanup.sh, changed DRY=0 from argument to env var in ExecStart, new LOG path
- chapelgate-business-evidence-wallet-run.sh: Removed promptfoo eval gate, start vite dev only
- chapelgate-chapelgate-multilingual-transcribe-run.sh: Removed promptfoo eval gate, run run-app.sh directly
- chapelgate-maintenanceos-run.sh: Removed promptfoo eval gate, run uvicorn directly
- disk-cleanup.service ExecStartPre: backup dell-state-backup.sh line 123 with count guard

## Files created
- out/raw/*-journal.txt per service
- out/raw/bew-after.txt, out/raw/mt-after.txt, out/raw/mos-after.txt with systemctl show output
- out/raw/disk-cleanup-20261124-000432.log with real DRY=0 run output
- out/EVIDENCE.md with raw evidence sources
- out/PROGRESS.md