# Root cause: estate-wide `error: EPIPE: broken pipe, write` in opencode 1.19.5

## Goal lock
OBJECTIVE -> stop the estate-wide EPIPE crashes without touching running jobs.
ACCEPTANCE -> evidenced file:line root cause, smallest reversible fix, 10/10 clean repro, council GO from 2 families, merged SHA.
EVIDENCE -> cycle logs, deterministic Node harness, red/green loop below.
NEXT ACTION -> commit fix on branch, prove at SHA, council, merge.

## Symptom (raw evidence)
Cycle logs across ~150 Dell units end with:
```
45 |       return applyHandlers(handlers, emitter, args), !0;
50 |     throw er;
                ^
error: EPIPE: broken pipe, write
      at emitError (node:events:50:13)
      at emitErrorNT (internal:streams/destroy:88:12)
      at emitErrorCloseNT (internal:streams/destroy:69:14)
```
Raw copies: `out/cycle-0937-1.log`, `cycle-0009-6.log`, `cycle-1014-7.log` in
`out-archive-20261123.tar.zst`; 76 EPIPE-bearing cycle logs recovered. The brief records
148/204 cycle logs with the same terminal error.

## Why it is inside opencode, not the shell redirect
`/home/andy/chapelgate/jobs-work-dell/tasks/dell-fix-failing-builds-20261111/job-run-v6.sh:142`
and `:147` invoke:
```
timeout 5400s $HOME/.opencode/bin/opencode run ... >> $LOG 2>&1
```
stdout/stderr go to a regular file (`$LOG`), so the top-level process cannot EPIPE on its
own stdout. The stack frames `emitError (node:events)` <- `emitErrorNT/emitErrorCloseNT
(internal/streams/destroy)` are Node's unhandled-`error` throw on a **destroyed stream with
no `error` listener**. The failing stream is inside opencode's Node process: a child-process
stdout/stderr pipe (bash tool / nested `opencode run` / MCP / log writer) whose read end is
closed by the consumer. With no listener, `emitError` throws, opencode prints the stack to
stderr (captured in the cycle log) and the cycle dies.

The log-writer-died hypothesis from the brief is disproved:
`~/.local/share/opencode/log/opencode.log` is actively written (mtime 23 Nov 19:58Z,
103 MB), so it is not a stale/dead pipe.

The simple repro (`repo/repro.sh`, `mkdir -p x && echo ok`, `--print-logs --log-level DEBUG`)
produces **0 EPIPE in ~50 raw runs** in `out-archive-20261123.tar.zst` (`out/raw/repro-*.log`):
the failure needs a closed reader on the pipe, not merely a bash tool call.

## Deterministic feedback loop (red-capable, diagnosing-bugs Phase 1)
`repo/epipe-repro.cjs` destroys a stream with an EPIPE/write error — the exact Node pattern
above. Before the fix it throws the unhandled `error` event (exit 1); after the fix exit 0.

- RED (no guard): `node repo/epipe-repro.cjs plain` -> `Error: EPIPE: broken pipe, write`
  with `at emitErrorNT (node:internal/streams/destroy:170:8)` and `emitErrorCloseNT`.
- GREEN (guard): `node -r repo/epipe-guard.cjs repo/epipe-repro.cjs plain` -> exit 0, no error.

## Root cause (one line)
opencode 1.19.5 does not attach an `error` listener to the stdout/stderr streams of its
child-process pipes; when the pipe reader closes (nested `opencode run` / tool timeout /
`| head` consumer), Node's `emitError` throws an unhandled `EPIPE: broken pipe, write` and
the whole cycle aborts.

## Fix (smallest, reversible, does not touch running jobs)
`repo/epipe-guard.cjs` — Node preload that attaches an `error` listener to stdout/stderr and
installs an `uncaughtException`/`unhandledRejection` handler; both swallow only
`EPIPE`/`ERR_STREAM_DESTROYED`. Any other error is printed and exits 1 (verified: a real
`Error("REAL-BUG")` still fails), so real faults are not masked. No global
`EventEmitter.emit` monkey-patch. Loaded via `NODE_OPTIONS=--require ...` set inline on the
two opencode runner invocation lines in `out/RUNNER-PATCH.diff` (eggbot applies), so only
the opencode process inherits it — not all runner Node processes. It changes no global
config, no opencode binary, no running job, no secrets, no frozen area. Rollback = revert
the runner line / unset NODE_OPTIONS.
`repo/opencode-safe.sh` is the equivalent wrapper for ad-hoc nested runs.
