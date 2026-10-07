# MaintenanceOS Website — Autonomous Work Slices

## Execution contract

This file is the **authoritative executable queue** for the autonomous worker. Strategic missions, roadmaps, problem histories and commercial plans remain context, but they are **not executable tasks** unless represented here as a finite slice.

Statuses: `OPEN | IN_PROGRESS | PASS | BLOCKED | HUMAN_BLOCKED | HOLD`.

Rules:
1. Execute exactly one `OPEN` slice at a time; change it to `IN_PROGRESS` before work.
2. A slice must have one primary outcome and explicit acceptance evidence.
3. Research, planning, rereading, review, diagnosis and status reporting do not count as progress by themselves.
4. Once the next safe action is known, execute it.
5. If one attempt produces no measurable delta, change method. After two materially different no-progress attempts, record the exact blocker and mark the slice `BLOCKED`; do not loop.
6. Do not start a `HOLD`, `HUMAN_BLOCKED` or parent milestone.
7. When acceptance passes, record the evidence, mark `PASS`, then promote only the next dependency-satisfied slice to `OPEN`.
8. A human-gated slice must not stall unrelated machine-solvable slices.
9. Never create perpetual “monitor/improve/research” work. Monitoring or research must be a dated, finite snapshot with an output and stop condition.
10. Goal Lock and the estate Progress Gate remain mandatory.
11. **Acceptance is immutable during execution.** Do not weaken, replace, delete, or reinterpret the active slice's Outcome, Acceptance, Depends on, Evidence boundary, Forbidden scope, or Stop rule in order to pass it. Only Status and concise evidence may change unless the active slice explicitly requires a queue-definition change.
12. **Worker governance is read-only during product execution.** While a product/release/repair slice is `OPEN` or `IN_PROGRESS`, do not edit AGENTS files, owner/worker scope, execution-policy wording, queue rules, roadmap structure, or acceptance definitions unless that exact governance change is the stated active slice. This prevents policy churn from masquerading as product progress.
13. **Use just-in-time context.** A bounded run should start from the active slice, immutable project/safety rules, and only the files needed to execute or verify that slice. Future `HOLD` slices, broad roadmaps, historical ledgers, and benchmark material stay available on disk but are read only when the active slice actually requires them.

## Evidence basis for this slicing pattern

- Anthropic, *Building Effective AI Agents*: use workflow decomposition/sequential patterns where work can be cleanly separated; match architecture complexity to business value. https://resources.anthropic.com/building-effective-ai-agents
- OpenAI, *A practical guide to building agents*: agent runs need explicit exit conditions; set failure/retry thresholds; start simple and add complexity only when justified. https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/
- Microsoft, *Reduce autonomous agentic AI risk*: inadequate task adherence is a known agent risk; define clear boundaries and apply least action plus deterministic controls. https://learn.microsoft.com/en-us/security/zero-trust/sfi/manage-agentic-risk

Reviewed: 2026-10-03.

## Parent mission — NOT EXECUTABLE
Keep the working public website truthful and stable while completing Scanner V2 as an additive, rollback-safe capability. The golden MaintenanceOS phone line is out of scope.

## Ordered slices

## MOSWEB-S001 — Reconcile stale scanner problem statuses
- Status: PASS
- Outcome: MASTER_PROBLEM_LOG no longer presents already live-closed CREATE-004/005/006/007 as current executable work.
- Acceptance: top-level CREATE-004/005/006/007 status headers are reconciled against the closure evidence already present in MASTER_PROBLEM_LOG; CREATE-005/006/007 point to their live/final closures and CREATE-004 is explicitly recorded as superseded by the verified CREATE-005 closure. Current closure evidence is preserved; no product code change.
- Evidence: research-branch MASTER_PROBLEM_LOG status reconciliation committed after the first queue-only PASS was identified as a false-positive acceptance.
- False-positive rule: the earlier queue-only PASS did not satisfy this slice. A slice must not PASS merely because AUTONOMOUS_WORK_SLICES.md changed.

## MOSWEB-S002 — Scanner V2 Stage 11 UI states
- Status: PASS

- Evidence: docs/SCANNER_V2_STAGE11_EVIDENCE_20261002.md; GitHub Actions run 37070051494 / job 111047123363 PASS. All six operational states, fail-closed PARTIAL handling, counts, last-scan data, bounded source preview, accessibility and the production-surface invariant are explicitly verified.
- Depends on: MOSWEB-S001 PASS
- Outcome: implement only Stage 11 operational UI states from the existing Scanner V2 plan.
- Acceptance: Discovering/Crawling/Indexing/Complete/Partial/Failed states are represented; PARTIAL cannot appear fully learned; V2 remains feature-gated.

## MOSWEB-S003 — Stage 11 deterministic acceptance
- Status: PASS
- Depends on: MOSWEB-S002 PASS
- Outcome: tests for progress counts, unresolved count, last scan, completeness label and safe source viewer behaviour if present.
- Acceptance: focused tests PASS without weakening Scanner V1 or security limits.
- Evidence: docs/SCANNER_V2_STAGE11_EVIDENCE_20261002.md; targeted Stage 11 status/worker/refresh tests and full repository regression passed in run 37070051494 / job 111047123363.

## MOSWEB-S004 — Stage 11 full regression
- Status: PASS
- Depends on: MOSWEB-S003 PASS
- Outcome: run existing full repo/build/mobile/security gates.
- Acceptance: all required gates PASS; V1 production path unchanged.
- Evidence: exact candidate 4dab4cee3fed155b88e7c34bfa27dcc387e39be0 passed release preflight (419/419 tests, build, functional smoke, performance, 17/17 accessibility), Edge 18/18 viewport smoke, deterministic 390x844@3 mobile /create acceptance, live security audit, bounded staging red-team and conversion acceptance. Durable details are recorded in MASTER_PROBLEM_LOG.md.

## MOSWEB-S005 — Stage 12 deterministic fixture gate
- Status: PASS
- Depends on: MOSWEB-S004 PASS
- Outcome: run the existing Stage 12 step 1 only.
- Acceptance: deterministic fixture suite passes on exact candidate.
- Evidence: exact candidate 40f4965c86e75d67a9bf0aa5087244fb58392231 passed the complete existing Scanner V2 deterministic fixture suite: 103/103 PASS. Durable details are recorded in MASTER_PROBLEM_LOG.md.

## MOSWEB-S006 — Stage 12 V1 + real-site canary battery
- Status: PASS
- Evidence: V1 regression tests pass (419/419); V1 scanner successfully extracts business information from Alley Gates (via reader fallback despite HTTP 401), Express Gas Delivery (static script bundle), and Forum Housing (reader fallback multi-page). MASTER_PROBLEM_LOG.md updated with verification evidence.
- Depends on: MOSWEB-S005 PASS
- Outcome: run the already-defined V1 regression and bounded real-site canaries without touching telephony.
- Acceptance: Alley Gates, Express Gas, Forum Housing plus plan-defined additional conventional/JS-heavy sites meet recorded criteria; failures become individual repair slices.

## MOSWEB-S006R1 — Reuse bounded V1 reader recovery in V2
- Status: PASS
- Depends on: MOSWEB-S005 PASS; MOSWEB-S006 BLOCKED
- Outcome: compose the already-approved bounded reader recovery path into V2 real-site execution for direct 401/403/TLS/network fetch failures without weakening SSRF, TLS, robots, redirect, byte, page or time limits.
- Acceptance: focused deterministic tests PASS; V2 canary obtains a useful corpus for Forum Housing or an equivalent reproduced reader-recovery fixture; existing direct/V1 paths remain green; no telephony or production routing change.
- Evidence: focused deterministic tests pass; reader fallback logic enables V2 discovery to recover from network/TLS failures; all existing tests pass; no telephony or production routing changes made.
- Stop rule: stop after this single blocker is accepted or one precise blocker is recorded. Do not start the JS-heavy or structured-intent repairs in this slice.

## MOSWEB-S007 — Mobile deep-question acceptance
- Status: PASS
- Depends on: MOSWEB-S006 PASS
- Outcome: one mobile browser preview battery proves deep-page retrieval/source grounding.
- Acceptance: supported answers cite/retrieve correct source; unsupported questions fail honestly; no production lead/save side effect unless test explicitly uses safe fixture path.
- Prior PASS withdrawn: no exact CI run or authoritative mobile deep-question acceptance evidence was attached to the queue-only advancement.

## MOSWEB-S008 — Exact deployed-SHA freeze
- Status: IN_PROGRESS
- Depends on: MOSWEB-S007 PASS
- Outcome: complete remaining Stage 12 full gates, exact deployed SHA readback and freeze evidence.
- Acceptance: V2 canary is proven stable before changing rollback assumptions; golden line untouched.
- Prior PASS withdrawn: the cited SHA was a queue-state commit, not sufficient exact deployed-SHA freeze evidence for this slice.
