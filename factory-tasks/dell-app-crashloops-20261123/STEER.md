
## eggbot 23 Nov 18:12
Also fix disk-cleanup.service: its ExecStartPre (factory-tasks/dell-ops-safeguards-20261119/repo/dell-services/backups/dell-state-backup.sh) exits 2 (INVALIDARGUMENT), so the clean-up never runs. eggbot ran disk-cleanup.sh DRY=0 once as a transient unit. Root-cause the pre-step (file:line), fix it with a backup, and prove `systemctl --user start disk-cleanup.service` succeeds (raw output in out/raw).

## eggbot 23 Nov 18:14
disk-cleanup.sh itself is also broken: it is not executable (Permission denied), it reads DRY from the environment so ExecStart arg DRY=0 leaves it in dry-run, and it tees to factory-tasks/foundation-dell-20261111/out/cleanup-dryrun.txt which no longer exists (exit 1). Fix all three plus the ExecStartPre exit 2, keep it to regenerable caches only, and prove a real run (df before/after in out/raw). Root is at 90%, which blocks keepalive relaunches, so this is urgent.

## eggbot 23 Nov 18:15 GMT — PRIORITY ORDER (public chief, newest note wins)
Disk comes FIRST: get disk-cleanup doing a real run (DRY=0 actually applied) and root under 85% tonight. Only delete what the existing cleanup policy covers (regenerable caches). Anything else goes in jobs-work-dell/readiness/PARKED.md, not deleted. Save df -h / before and after to out/raw. Then do the app crashloops.

## STEER 23 Nov 19:31 GMT (keepalive done gate)
MISSION_COMPLETE rejected: evidence gate: MISSION_COMPLETE claims 3 passed but no raw output shows 3 passed; See out/VERIFIER-FEEDBACK.md.
