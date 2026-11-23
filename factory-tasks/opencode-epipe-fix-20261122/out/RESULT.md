# RESULT — job-opencode-epipe-fix (PASS)

Root cause found and fixed. The estate-wide `error: EPIPE: broken pipe, write` in opencode
1.19.5 is an unhandled `error` event (Node `emitError` <- `emitErrorNT/emitErrorCloseNT`)
on a child-process stdout/stderr stream whose reader closes; the runner redirects top-level
output to a file, so the fault is inside opencode. Full evidence in `out/ROOT-CAUSE.md`.

Fix: `repo/epipe-guard.cjs` is a narrow Node preload that swallows only EPIPE /
ERR_STREAM_DESTROYED on stdout/stderr and via uncaughtException/unhandledRejection, and
rethrows (prints + exits 1) every other error. `out/RUNNER-PATCH.diff` applies it inline to
the two opencode runner lines only (eggbot applies); no global config, binary, running job,
secret or frozen area is touched; rollback is reverting the patch.

Verification at fix head `25bc03d2db3cf1e4810fab08369b64eb1f33ec87`:
RED `out/raw/epipe-red-before-20261123-201225-output.log` = exit 1 with exact EPIPE stack;
GREEN `out/raw/epipe-proof-after-20261123-201225-output.log` =
`TOTAL_RUNS=10 PASS=10 FAIL=0 EPIPE_TOTAL=0` (exit 0); real-error control
`out/raw/epipe-nonepipe-fatal-20261123-201227-output.log` = exit 1 (no masking).

Council: estate-coding (main retry after deepseek 600s timeout; qwen down) and
mac/gpt-oss-120b both returned line-level GO at the exact fix head; first-round Mac NO-GO
concerns (global emit patch, blanket NODE_OPTIONS, masking) were all resolved.
See `out/council/VERDICT.md`.

Merged at `ea1d6767f9f89b9ac467f1098dbd5858ee8d1a61` (out/FIX-MERGED.md). Re-test at the
merged SHA: `out/raw/epipe-merged-retest-20261123-201806-output.log` =
`TOTAL_RUNS=10 PASS=10 FAIL=0 EPIPE_TOTAL=0` (exit 0). No push (origin is unrelated
maintenanceos-website); `out/PUSH-REQUEST.md` requests relay to the estate runner owner.
