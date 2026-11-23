# PROGRESS.md

Date: 2026-11-23 20:00Z. Cycle: 1954-3 (hy4-flash-free).

- [x] 1. Find opencode executable (`/home/andy/.opencode/bin/opencode`, v1.19.5).
- [x] 2. Create reproduction script `repo/repro.sh`.
- [x] 3. Run repro; 0 EPIPE in ~50 raw runs; recovered 76 EPIPE-bearing cycle logs from
      `out-archive-20261123.tar.zst`, 148/204 per brief.
- [x] 4. Root cause named with evidence in `out/ROOT-CAUSE.md` (node:events emitError on a
      destroyed child-process stream with no error listener; log-writer-dead hypothesis
      disproved with live mtime 23 Nov 19:58Z).
- [x] 5. Tight deterministic red/green feedback loop built: `repo/epipe-repro.cjs` +
      `repo/epipe-guard.cjs`. RED exit 1, GREEN exit 0 verified.
- [x] 6. Fix written: `repo/epipe-guard.cjs`, `repo/opencode-safe.sh`, `repo/proof.sh`,
      `out/RUNNER-PATCH.diff`.
- [x] 7. Fix committed on `fix/opencode-epipe-guard` (fix head 25bc03d2, narrowed guard); raw
      red/green/real-error proofs at that SHA in `out/raw/`.
- [x] 8. Council GO from 2 families at exact head 25bc03d2: estate-coding (main retry after
      deepseek 600s timeout; qwen down) + mac/gpt-oss-120b. First-round Mac NO-GO resolved.
      `out/council/VERDICT.md`.
- [x] 9. Merged locally at `ea1d6767f9f89b9ac467f1098dbd5858ee8d1a61`; `out/FIX-MERGED.md`.
      Re-test at merged SHA: 10/10 PASS, EPIPE_TOTAL=0 (`out/raw/epipe-merged-retest-*`).
- [x] 10. `out/EVIDENCE.md`, `out/RESULT.md`, `out/MISSION_COMPLETE`, `out/PUSH-REQUEST.md`.
