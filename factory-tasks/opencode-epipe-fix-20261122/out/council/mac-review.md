<!-- family: mac/gpt-oss-120b (LM Studio, Mac Studio) via 127.0.0.1:11234; 2026-11-23T20:11:46+00:00; 21s -->
**FINDINGS**

| File | Line(s) / Section | Observation |
|------|-------------------|-------------|
| `repo/epipe-guard.cjs` | 1‑4 | Uses `process.env.NODE_OPTIONS = '--require ' + __filename + (process.env.NODE_OPTIONS ? ' ' + process.env.NODE_OPTIONS : '')`; this **prepends** the guard to any existing `NODE_OPTIONS`. If another part of the system relies on ordering of preload modules, this could change behaviour. |
| `repo/epipe-guard.cjs` | 12‑20 | Attaches an `'error'` listener to `process.stdout` and `process.stderr` that **swallows** errors whose `code` is `"EPIPE"` or `"ERR_STREAM_DESTROYED"`. It then **re‑throws** any other error. This is the core mitigation, but it silently discards *all* EPIPEs on the top‑level streams, even those that might be legitimate signals of a broken pipe from an upstream consumer (e.g., when the runner itself is piped into another process). |
| `repo/epipe-guard.cjs` | 23‑31 | Monkey‑patches `EventEmitter.prototype.emit` to return `true` for `'error'` events whose error code matches the two guarded codes. This changes the semantics of `emit` globally for **all** EventEmitters in the process, not just the stdout/stderr streams. Any library that checks the return value of `emit('error', err)` could now get a false‑positive “handled” result and skip its own error handling logic. |
| `repo/opencode-safe.sh` | 3‑6 | Wrapper script sets `NODE_OPTIONS=--require $HOME/.config/opencode/epipe-guard.cjs` **unconditionally**, then `exec "$@"`. The wrapper is intended to be used only for the opencode binary, but the patch injects this environment variable directly into the runner’s invocation lines (see diff). This means *any* Node process started by the runner (including future tooling that may be added) will inherit the guard without explicit opt‑in. |
| `out/RUNNER-PATCH.diff` | line adding `< /dev/null` to runner command | Redirects stdin from `/dev/null`. This is harmless for current usage but could interfere with tools that expect a live stdin (e.g., interactive debugging or future extensions). |
| `repo/epipe-repro.cjs` & `repo/proof.sh` | test harness only | Demonstrates the guard works for the synthetic case, but does not exercise interaction with *real* downstream consumers of opencode’s stdout/stderr (e.g., log‑aggregators, CI pipelines). |

**RISKS**

1. **Over‑broad error suppression** – By swallowing every `EPIPE`/`ERR_STREAM_DESTROYED` on the process’ standard streams, we may hide genuine pipe‑breakage that should cause the job to fail (e.g., when a downstream log collector crashes). This could lead to silent data loss or incomplete logs being reported as successful runs.

2. **Global `EventEmitter.emit` monkey‑patch** – Changing the return value of `emit` for *all* emitters is a very invasive change. Libraries that rely on the boolean result (rare but possible) will now think their error event was handled when it wasn’t, potentially suppressing their own cleanup or retry logic.

3. **Implicit preload for all Node processes** – Setting `NODE_OPTIONS` at the runner level means any future Node‑based tool invoked by the same runner inherits the guard, even if that tool does not need it. This expands the attack surface: a bug in the guard could affect unrelated tooling, and debugging other tools becomes harder because their error stacks are altered.

4. **Potential ordering conflicts** – Prepending the guard to existing `NODE_OPTIONS` may change the load order of other preload modules, which can cause subtle breakage if those modules depend on being loaded before/after certain code (e.g., instrumentation libraries).

5. **Future compatibility** – The guard checks error codes `"EPIPE"` and `"ERR_STREAM_DESTROYED"`. Node internals could introduce new error identifiers for broken pipe scenarios in later versions, leaving the runner vulnerable again.

**VERDICT**

The patch does *demonstrate* that the specific `EPIPE` crash observed in opencode 1.19.5 is avoided under the test harness, and it respects the constraint of not modifying frozen binaries or requiring privileged operations. However, the mitigation is **overly broad**, modifies core Node runtime behaviour globally, and may mask legitimate failures downstream.

Given the severity of silently ignoring pipe errors in a production CI/runner environment, the current implementation does not meet the “fail fast / surface real errors” principle expected for this infrastructure.

**Verdict: NO‑GO**

*Recommendation*: Limit the guard to the specific stream objects created by opencode (e.g., wrap the child‑process stdout/stderr streams directly) rather than globally patching `process.stdout`, `process.stderr`, and `EventEmitter.emit`. Apply the preload **only** when launching opencode, not via a blanket `NODE_OPTIONS` injection in the runner. Consider adding explicit handling inside opencode’s own code path if possible, or use a wrapper that spawns opencode with its own dedicated Node process where the guard is scoped. This would address the crash without the collateral risks identified above.
