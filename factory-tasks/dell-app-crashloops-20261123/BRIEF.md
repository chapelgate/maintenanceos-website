# Dell app service crashloops (23 Nov 2026, public chief 18:00 teardown item 8)
Three Dell staging app services were crash-looping and have been STOPPED by eggbot to cut load: chapelgate-business-evidence-wallet.service (1,414 restarts; promptfoo crash, exit 1), chapelgate-chapelgate-multilingual-transcribe.service (3,823 restarts, exit 1, 127.0.0.1:3406), chapelgate-maintenanceos.service (69 restarts; a "1 failed (50%)" check then exit 1).
Run scripts: /home/andy/chapelgate/dell-services/business-evidence-wallet-run.sh, chapelgate-multilingual-transcribe-run.sh, maintenanceos-run.sh. Logs: `journalctl --user -u <unit> -n 200 --no-pager` (export XDG_RUNTIME_DIR=/run/user/$(id -u)).
For each service:
1. Save the journal tail to out/raw/<unit>-journal.txt and write the root cause to out/ROOT-CAUSE.md (file:line in the run script).
2. Fix the run script so the service starts the app only (no test or eval tool like promptfoo inside a long-running service). Back up as <file>.bak-council-YYYYMMDD-HHMM, bash -n, atomic replace.
3. Start the service, wait 10 minutes, and save `systemctl --user show -p NRestarts,ActiveState <unit>` before and after to out/raw. Pass = active with zero new restarts.
4. If a fix fails twice, leave that service stopped and record why in out/RESULT.md.
Never touch golden-line-test-5238, omni-tunnel, the omniroute container, local-dell-llama or anything in readiness/security/. No deletes. Follow readiness/RUNNER-RULES.md.
Done: out/RESULT.md (>=200 bytes) per service, and out/MISSION_COMPLETE line 1 "PASS <n> passed, 0 failed <services>" with n = services stable.
