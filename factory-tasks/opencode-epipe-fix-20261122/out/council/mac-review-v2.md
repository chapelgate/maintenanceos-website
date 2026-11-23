<!-- family: mac/gpt-oss-120b (LM Studio, Mac Studio) via 127.0.0.1:11234; 2026-11-23T20:12:59+00:00; 17s -->
**FINDINGS**

| File | Line(s) | Observation |
|------|---------|--------------|
| `repo/epipe-guard.cjs` | 12‑18 | Registers **process.stdout.on('error')** and **process.stderr.on('error')** listeners that check `err.code === 'EPIPE' || err.message.includes('ERR_STREAM_DESTROYED')`. All other errors are re‑thrown (logged to stderr then `process.exit(1)`). This matches the “narrowed” requirement – only the specific pipe‑breakage errors are swallowed. |
| `repo/epipe-guard.cjs` | 22‑27 | Adds **process.on('uncaughtException')** and **process.on('unhandledRejection')** handlers that perform the same EPIPE check before exiting. No global monkey‑patch of `EventEmitter.emit`; the guard is limited to the process that loads this preload file. |
| `repo/epipe-guard.cjs` | 31‑34 | Exports nothing; the module’s side‑effects are all that matter, keeping the surface area minimal. |
| `out/RUNNER-PATCH.diff` | +13 (opencode invocation) | Inserts `NODE_OPTIONS="--require $HOME/.config/opencode/epipe-guard.cjs"` **inline** on the two `opencode` command lines only. The rest of the runner script is untouched, so no other jobs inherit this preload. |
| `out/RUNNER-PATCH.diff` | +14 (opencode invocation) | Appends `< /dev/null` to each opencode call, ensuring that the parent’s stdin is closed and preventing accidental reads from a dead pipe. This does not affect any environment variables outside the command line. |
| `repo/opencode-safe.sh` | 5‑9 | Thin wrapper that forwards arguments to the real `opencode` binary after confirming the guard file exists. No extra privileges or filesystem writes beyond reading the guard script. |
| `repo/epipe-repro.cjs` & `repo/proof.sh` | entire files | Provide a deterministic harness used only in CI; they write under `/tmp` and never touch production data. |
| `out/ROOT-CAUSE.md` | 27‑33 | Documents the exact stack trace that triggered the crash, confirming it originates from an unhandled `'error'` event on a destroyed stdout/stderr stream inside opencode. The fix directly addresses this path. |

**RISKS & MITIGATIONS**

1. **Risk – Swallowing non‑EPIPE errors:**  
   *Mitigation:* The guard explicitly checks the error code/message and re‑throws any other error (logs to stderr then exits with status 1). The test `epipe-nonepipe-fatal-…` demonstrates that a fabricated `Error("REAL‑BUG")` still aborts the process, satisfying the “do not mask real bugs” constraint.

2. **Risk – Preload only applied to opencode invocations:**  
   *Mitigation:* The diff injects `NODE_OPTIONS=--require …` **inline** on the two command lines; there is no export or environment mutation that would affect subsequent commands or other jobs. Rollback simply removes those two lines.

3. **Risk – Potential side‑effects from closing stdin (`< /dev/null`):**  
   *Mitigation:* Opencode does not read from stdin in normal operation, and the runner already redirects its own stdout/stderr to files. Adding `< /dev/null` is a no‑op for the existing workflow and matches prior practice in many CI pipelines.

4. **Risk – File permission leakage (guard script location):**  
   *Mitigation:* The guard lives under `$HOME/.config/opencode/`, a user‑writable, non‑shared directory. No privileged directories are touched; no sudo is required.

5. **Risk – Future opencode versions changing error emission semantics:**  
   *Mitigation:* The guard’s logic is deliberately narrow (EPIPE / ERR_STREAM_DESTROYED). If opencode later emits a different error for the same condition, the guard will not swallow it, causing the process to fail loudly—preferable to silently ignoring new failure modes.

**VERDICT**

The submitted changes:

* Directly address the root cause by handling the specific `EPIPE`/`ERR_STREAM_DESTROYED` errors on the child’s stdout/stderr streams.
* Do **not** introduce a global `EventEmitter.emit` monkey‑patch or blanket `NODE_OPTIONS` that would affect unrelated processes.
* Preserve normal error visibility for any non‑pipe failures, as demonstrated by the test harness.
* Operate entirely within user‑writable space and respect all listed constraints (no sudo, no DB writes, no modifications to frozen areas).

**GO** – the fix is sound, narrowly scoped, and passes the provided verification suite. No further changes are required before merging.
