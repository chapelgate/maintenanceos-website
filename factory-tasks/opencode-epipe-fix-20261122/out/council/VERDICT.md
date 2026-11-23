# Council verdict — EPIPE fix at exact head 25bc03d2db3cf1e4810fab08369b64eb1f33ec87

Branch: `fix/opencode-epipe-guard` (base `feat/fe-receptionist`). Date: 2026-11-23 20:13Z.

## Family 1 (main) — estate-coding (retry family)
`opencode/deepseek-v4.1-flash-free` was the configured main family but timed out
(exit 124 after 600s; `out/council/deepseek-review.raw` contains only the model header;
multiple concurrent estate deepseek runs were active). Per `RUNNER-RULES.md` rule 5 the
review was retried on the next available family. `qwen4-max-free` is down
(`dell-services/model-pin/QWEN-DOWN` present), so **estate-coding** was used as the main
review family. Review file: `out/council/main-review-v2.raw` (exit 0).

Findings: `repo/epipe-guard.cjs:1-3` narrow EPIPE-only swallow; `:4-8` fatal path for real
errors; `:9-10` uncaughtException/unhandledRejection cover the child-pipe EPIPE that is the
actual root cause; `:11-14` no global EventEmitter.emit patch; `out/RUNNER-PATCH.diff:10,19`
NODE_OPTIONS inline on opencode lines only; `repo/opencode-safe.sh:5` opt-in wrapper;
`repo/proof.sh:10,17` deterministic 10-run harness.
Verdict: **GO**.

## Family 2 (second) — mac/gpt-oss-120b (LM Studio, Mac Studio via 127.0.0.1:11234)
Review file: `out/council/mac-review-v2.md` (exit 0, 17s). Header names the family.

Findings: `repo/epipe-guard.cjs:12-18` stdout/stderr listeners swallow only EPIPE /
ERR_STREAM_DESTROYED; `:22-27` uncaughtException/unhandledRejection, no global emit patch;
`out/RUNNER-PATCH.diff:10,19` inline NODE_OPTIONS only on the two opencode lines plus
`< /dev/null`; `repo/opencode-safe.sh:5-9` thin opt-in wrapper; `out/ROOT-CAUSE.md:27-33`
exact stack. Risks and mitigations recorded (non-EPIPE still fatal, no global env mutation,
no privileged paths, fail-loud on future error codes).
Verdict: **GO**.

## First-round NO-GO resolved
The first Mac review (`out/council/mac-review.md`) was NO-GO on three points: global
`EventEmitter.emit` patch, blanket `NODE_OPTIONS`, and error masking. All three were fixed
in commit `25bc03d2`: the emit patch was removed, NODE_OPTIONS is inline on opencode only,
and `out/raw/epipe-nonepipe-fatal-20261123-201227-output.log` proves a real error still
exits 1. Both families re-reviewed the new exact head and returned GO.

## Decision
Two independent families, line-level findings, both GO at exact head
`25bc03d2db3cf1e4810fab08369b64eb1f33ec87`. Green proofs at that SHA are in `out/raw/`.
Decision: **MERGE** (local authorised path; no push — `origin` is unrelated
maintenanceos-website, so pushing would be unsafe; see `out/PUSH-REQUEST.md`).
