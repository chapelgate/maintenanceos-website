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
- [ ] 7. Commit fix on branch; re-run proof at committed SHA via `rt` (raw evidence).
- [ ] 8. Council GO from 2 families (deepseek + mac-gpt-oss-120b) at exact head.
- [ ] 9. Merge via authorised path; write SHA to `out/FIX-MERGED.md`.
- [ ] 10. `out/EVIDENCE.md`, `out/RESULT.md` (>=300 bytes), `out/MISSION_COMPLETE`.
