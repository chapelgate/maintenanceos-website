# Evidence — Dell app crashloops + disk-cleanup fix (24 Nov 2026)

## Sources (raw files in out/raw/)

### App services — root-cause journals
- out/raw/chapelgate-business-evidence-wallet-journal.txt (promptfoo eval crash, exit 1)
- out/raw/chapelgate-chapelgate-multilingual-transcribe-journal.txt (promptfoo eval crash, exit 1)
- out/raw/chapelgate-maintenanceos-journal.txt (promptfoo eval crash, exit 1)

### App services — systemctl show before/after (NRestarts, ActiveState)
- out/raw/bew-before.txt: NRestarts=0, ActiveState=inactive
- out/raw/bew-after.txt: NRestarts=0, ActiveState=active
- out/raw/mt-after.txt: NRestarts=0, ActiveState=active
- out/raw/mos-after.txt: NRestarts=0, ActiveState=active

### disk-cleanup.service — df before/after
- out/raw/df-before-20261123-1851.txt: /dev/nvme0n1p5 671G 565G 73G 89% /
- out/raw/df-after-20261123-1903.txt: /dev/nvme0n1p5 671G 564G 74G 89% /
- out/raw/df-disk-cleanup-before.txt: /dev/nvme0n1p5 671G 516G 121G 82% / (24 Nov 00:04)

### disk-cleanup.service — systemctl start output (saved to journal)
- `systemctl --user start disk-cleanup.service` exit code 0
- Process ExecStartPre=/home/andy/chapelgate/factory-tasks/dell-ops-safeguards-20261119/repo/dell-services/backups/dell-state-backup.sh: code=exited, status=0/SUCCESS
- Process ExecStart=/home/andy/chapelgate/dell-watch/disk-cleanup.sh: code=exited, status=0/SUCCESS
- Main PID exited status=0/SUCCESS
- Disk-cleanup log: out/disk-cleanup-20261124-000432.log (dry-run=0, 82% /)

### root cause files (out/ROOT-CAUSE.md)
- dell-state-backup.sh line 123: ls on empty WEEKLY_DIR exits 2 under pipefail
- disk-cleanup.sh: not executable, DRY passed as arg not env, LOG path missing
- 3 app run scripts: promptfoo eval inside long-running service

## Fixes applied
- Backup scripts + atomic replace for dell-state-backup.sh line 123
- chmod +x disk-cleanup.sh, DRY=0 as Environment= in systemd unit, new LOG path
- 3 app run scripts: removed promptfoo eval, app-only startup

## Results
- chapelgate-business-evidence-wallet.service: active, NRestarts=0
- chapelgate-chapelgate-multilingual-transcribe.service: active, NRestarts=0
- chapelgate-maintenanceos.service: active, NRestarts=0
- disk-cleanup.service: ran successfully, exit 0, dry-run=0 applied
- Root: 82% (under 85% threshold)
