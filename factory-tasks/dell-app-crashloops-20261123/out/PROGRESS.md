# Progress — Dell app crashloops (24 Nov 2026)

## STEER priority order (newest note wins)
1. Disk FIRST: disk-cleanup real run, root under 85% tonight.
2. Then app crashloops (3 services).

## Root causes identified
- **disk-cleanup.service ExecStartPre exit 2**: `dell-state-backup.sh` line 123 `ls -1t "$WEEKLY_DIR"/dell-state-*.tar.zst` exits 2 when weeklies dir is empty; under `set -euo pipefail`/`pipefail` this aborts the script.
- **disk-cleanup.sh**: not executable (-rw-rw-r--); ExecStart passes `DRY=0` as an ARG not env var so `DRY=${DRY:-1}` stays 1; output path `~/chapelgate/factory-tasks/foundation-dell-20261111/out/cleanup-dryrun.txt` no longer exists → tee exit 1.
- **3 app run scripts**: all invoke `npx --yes promptfoo@0.123.1 eval` which crashes (exit 1), blocking service start. Per BRIEF step 2: fix run scripts to start app only, no test/eval tool inside long-running service.

## Completed
- Fix dell-state-backup.sh line 123 (backup + atomic replace with count guard)
- Fix disk-cleanup.sh (chmod +x, DRY env, output path) + backup
- Fix disk-cleanup.service ExecStart (DRY=0 as Environment=) + backup
- Fix 3 app run scripts (remove promptfoo) + backup + bash -n + atomic replace
- Root-cause journal tails saved to out/raw/<unit>-journal.txt
- Start each service, wait 10 min, verify NRestarts/ActiveState stable
- out/RESULT.md per service (>=200 bytes), out/MISSION_COMPLETE line 1 "PASS n passed, 0 failed <services>"
- disk-cleanup real run completed: root at 82% (under 85%)
- All 4 services stable: 3 app services active with NRestarts=0, disk-cleanup ran successfully

## Evidence
- out/EVIDENCE.md with raw evidence sources
- out/raw/ contains all systemctl show outputs, journal tails, df before/after