# EVIDENCE.md — job-opencode-epipe-fix

All test/typecheck/build claims cite only `rt`-captured files under `out/raw/`. Full SHA
copied only from `out/raw/SHA`.

## Root cause
`out/ROOT-CAUSE.md`: unhandled `error` (EPIPE) on a destroyed stream inside opencode 1.19.5
(`emitError` node:events <- `emitErrorNT/emitErrorCloseNT` internal/streams/destroy) when a
child-process stdout/stderr pipe reader closes. Runner `job-run-v6.sh:142,147` redirects
stdout/stderr to a file, so the fault is internal. Log-writer-dead theory disproved by live
mtime. 76 EPIPE cycle logs recovered from `out-archive-20261123.tar.zst`; 148/204 per brief.

## Raw verification (exact SHAs from out/raw/SHA at time of each run)
- Fix head `25bc03d2db3cf1e4810fab08369b64eb1f33ec87`:
  - `out/raw/epipe-red-before-20261123-201225-output.log` + exit-code `1` — exact EPIPE
    stack, no guard.
  - `out/raw/epipe-proof-after-20261123-201225-output.log` + exit-code `0` —
    `TOTAL_RUNS=10 PASS=10 FAIL=0 EPIPE_TOTAL=0`.
  - `out/raw/epipe-nonepipe-fatal-20261123-201227-output.log` + exit-code `1` — a real
    `Error("REAL-BUG")` is still fatal (no error masking).
- Merged commit `ea1d6767f9f89b9ac467f1098dbd5858ee8d1a61`:
  - `out/raw/epipe-merged-retest-20261123-201806-output.log` + exit-code `0` —
    `TOTAL_RUNS=10 PASS=10 FAIL=0 EPIPE_TOTAL=0`.
- `out/raw/INDEX.tsv` lists every rt run with timestamp, exit code, SHA and command.

## Council (independent, line-level, both GO at exact fix head)
- Main retry family estate-coding: `out/council/main-review-v2.raw` (deepseek timed out,
  `out/council/deepseek-review.raw`; qwen down per `QWEN-DOWN`).
- Second family mac/gpt-oss-120b: `out/council/mac-review-v2.md`.
- Combined verdict and decision: `out/council/VERDICT.md`.
- First-round Mac NO-GO (`out/council/mac-review.md`) resolved in `25bc03d2`.

## Merge
`out/FIX-MERGED.md` — merge SHA `ea1d6767f9f89b9ac467f1098dbd5858ee8d1a61`.
`out/PUSH-REQUEST.md` — no push (origin is unrelated maintenanceos-website).

## Constraints honoured
No sudo, no spend, no deletes outside /tmp, no force-push, no shared opencode.db writes,
no config overwrite, no frozen area touched, no secrets printed. Skills used in
`out/SKILLS-USED.md`.
