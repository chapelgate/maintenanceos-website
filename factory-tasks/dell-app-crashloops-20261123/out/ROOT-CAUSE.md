# Root Causes — Dell crashloop fixes (23 Nov 2026)

## disk-cleanup.service ExecStartPre exit 2
**File:** `dell-state-backup.sh` line 123
**Root cause:** `ls -1t "$WEEKLY_DIR"/dell-state-*.tar.zst 2>/dev/null | tail -n +9 | while read -r w; do rm -f "$w" "${w%.tar.zst}.sha256"; done` exits with code 2 when the weeklies directory is empty, and under `set -euo pipefail` this aborts the entire script. The weekly dir had no prior backups, so the ls command returned nothing, exit 2 killed the script via pipefail.

**Fix:** Guard the ls with a count check: `if [ "$(ls -1 "$WEEKLY_DIR"/dell-state-*.tar.zst 2>/dev/null | wc -l)" -gt 0 ]; then ... fi`

## disk-cleanup.sh: not executable, DRY env, output path
**File:** `dell-watch/disk-cleanup.sh`
**Root cause:** 
1. File permissions were `-rw-rw-r--` (not executable), so systemd could not execute it.
2. `DRY=0` was passed as a command-line argument rather than an environment variable, so `DRY=${DRY:-1}` in the script always resolved to 1 (dry-run mode).
3. `LOG=~/chapelgate/factory-tasks/foundation-dell-20261111/out/cleanup-dryrun.txt` referenced a path that no longer exists, causing `tee -a "$LOG"` to fail with exit 1.

**Fix:** `chmod +x disk-cleanup.sh`; changed `ExecStart=/home/andy/chapelgate/dell-watch/disk-cleanup.sh DRY=0` to `Environment=DRY=0` in systemd unit; new LOG path at `/home/andy/chapelgate/dell-watch/out/disk-cleanup-<timestamp>.log`.

## chapelgate-business-evidence-wallet-run.sh: promptfoo eval blocks service
**File:** `dell-services/business-evidence-wallet-run.sh` line 12-14
**Root cause:** The script invoked `npx --yes promptfoo@0.123.1 eval -c ...` which fails because the promptfoo config file was missing, and this eval gate blocks the long-running service from starting. Per BRIEF.md step 2, eval tools must not be inside a long-running service.

**Fix:** Removed the promptfoo eval block (lines 12-14). Service now starts PostgreSQL then `vite dev` directly.

## chapelgate-multilingual-transcribe-run.sh: promptfoo eval blocks service
**File:** `dell-services/chapelgate-multilingual-transcribe-run.sh` line 3-4
**Root cause:** The script invoked `npx --yes promptfoo@0.123.1 eval -c ...` which crashes and blocks the service from running. Per BRIEF.md step 2, eval tools must not be inside a long-running service.

**Fix:** Removed the promptfoo eval block. Service now runs the run-app.sh script directly.

## chapelgate-maintenanceos-run.sh: promptfoo eval blocks service
**File:** `dell-services/maintenanceos-run.sh` line 8-10
**Root cause:** The script invoked `npx --yes promptfoo@0.123.1 eval -c ...` which crashes and blocks the service from running. Per BRIEF.md step 2, eval tools must not be inside a long-running service.

**Fix:** Removed the promptfoo eval block. Service now runs uvicorn directly.