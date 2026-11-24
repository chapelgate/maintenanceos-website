# Progress — Dell app crashloops (24 Nov 2026)

## STEER priority order (newest note wins)
1. Disk FIRST: disk-cleanup real run, root under 85% tonight.
2. Then app crashloops (3 services).

## Root causes identified
- **disk-cleanup.service ExecStartPre exit 2**: `dell-state-backup.sh` line 123 `ls -1t "$WEEKLY_DIR"/dell-state-*.tar.zst` exits 2 when weeklies dir is empty; under `set -euo pipefail`/`pipefail` this aborts the script.
- **disk-cleanup.sh**: not executable (-rw-rw-r--); ExecStart passes `DRY=0` as an ARG not env var so `DRY=${DRY:-1}` stays 1; output path `~/chapelgate/factory-tasks/foundation-dell-20261111/out/cleanup-dryrun.txt` no longer exists -> tee exit 1.
- **3 app run scripts**: all invoke `npx --yes promptfoo@0.123.1 eval` which crashes (exit 1), blocking service start. Per BRIEF step 2: fix run scripts to start app only, no test/eval tool inside long-running service.

## Completed (24 Nov 2026, this cycle)
- Fix dell-state-backup.sh line 123 (backup + atomic replace with count guard)
- Fix disk-cleanup.sh (chmod +x, DRY env, output path) + backup
- Fix disk-cleanup.service ExecStart (DRY=0 as Environment=) + backup
- Fix 3 app run scripts (remove promptfoo) + backup + bash -n + atomic replace
- Root-cause journal tails saved to out/raw/<unit>-journal.txt
- Restarted chapelgate-business-evidence-wallet.service (was NRestarts=1 from earlier); now NRestarts=0 active running
- disk-cleanup.service real run today 09:57 UTC (executed as a transient unit): start exit=0, Result=success, dry-run=0 applied, out/raw/disk-cleanup-20261124-0957.log
- df before/after disk-cleanup start: out/raw/df-before-20261124-0957.txt, out/raw/df-after-20261124-0957.txt
- All 3 app services 10-min stability window captured: out/raw/stability-before-20261124-0957.txt, out/raw/stability-after-20261124-1019.txt (all NRestarts=0, active, running)
- out/RESULT.md and out/EVIDENCE.md updated with raw evidence file names
- disk-cleanup.service disabled on boot (environment=DRY=0, [Install] WantedBy=default.target) — no accidental runs on reboot; transient manually-started runs only

## Pending (evidence gate)
- Prepare PR for commit d0fc3e6f on branch feat/fe-receptionist with all raw evidence
- Run two councils (main family estate-coding; second family Mac gpt-oss-120b via mac-review.sh) at the exact head SHA
- Update MISSION_COMPLETE with PR number and head SHA
