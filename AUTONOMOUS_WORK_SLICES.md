# MaintenanceOS — Autonomous Work Slices

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

## Evidence basis for this slicing pattern

- Anthropic, *Building Effective AI Agents*: use workflow decomposition/sequential patterns where work can be cleanly separated; match architecture complexity to business value. https://resources.anthropic.com/building-effective-ai-agents
- OpenAI, *A practical guide to building agents*: agent runs need explicit exit conditions; set failure/retry thresholds; start simple and add complexity only when justified. https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/
- Microsoft, *Reduce autonomous agentic AI risk*: inadequate task adherence is a known agent risk; define clear boundaries and apply least action plus deterministic controls. https://learn.microsoft.com/en-us/security/zero-trust/sfi/manage-agentic-risk

Reviewed: 2026-10-03.

## Parent mission — NOT EXECUTABLE
Get MaintenanceOS demonstrably ready for one controlled real test call without touching the golden phone line outside explicit gates. The ten-step tracker remains the strategic release ladder.

## Ordered slices

## MOS-S001 — Reconfirm current source regression baseline
- Status: OPEN
- Outcome: current main passes the existing non-live unit/integration/security regression needed for pre-call work.
- Acceptance: exact run evidence recorded; no carrier call and no phone-route mutation.

## MOS-S002 — Reconcile open call-defect fixes
- Status: HOLD
- Depends on: MOS-S001 PASS
- Parent: tracker steps 3 and 5
- Outcome: one matrix maps each previously observed live-call defect to current code fix + automated coverage + missing carrier evidence.
- Acceptance: no defect is declared fixed from memory.

## MOS-S003 — Prove runtime/persistence pre-call requirements
- Status: HOLD
- Depends on: MOS-S002 PASS
- Parent: tracker step 7
- Outcome: finite runtime/persistence evidence needed before a controlled call.
- Acceptance: existing non-phone verification passes; no live call.

## MOS-S004 — Re-establish external environment/readiness
- Status: HOLD
- Depends on: MOS-S003 PASS
- Parent: tracker step 8
- Outcome: one read-only/current environment and readiness record for the actual intended runtime.
- Acceptance: exact service/config facts are current; no safety flag is enabled merely to inspect state.

## MOS-S005 — Build pre-call acceptance checklist
- Status: HOLD
- Depends on: MOS-S004 PASS
- Outcome: exact one-call script, expected behaviours, stop conditions, rollback/close-window action and evidence fields.
- Acceptance: every criterion is observable during/after one call; no vague “sounds good” criterion.

## MOS-S006 — Controlled test-call authorisation
- Status: HUMAN_BLOCKED
- Depends on: MOS-S005 PASS
- Outcome: Andrew authorises the exact controlled test window/call if still required.

## MOS-S007 — Execute one controlled carrier call
- Status: HOLD
- Depends on: MOS-S006 PASS
- Parent: tracker step 9
- Outcome: one authorised call only.
- Acceptance: checklist evidence captured; no unrelated phone/voice changes; window closed again as required.

## MOS-S008 — Repair one reproduced call failure
- Status: HOLD
- Depends on: MOS-S007 produces a failure; otherwise PASS/SKIP
- Outcome: smallest repair for one reproduced acceptance failure.
- Acceptance: targeted automated regression passes; a new carrier retest requires its own human gate.

## MOS-S009 — Final release decision
- Status: HOLD
- Depends on: MOS-S007 PASS and MOS-S008 PASS/SKIP
- Parent: tracker step 10
- Outcome: evidence-backed READY / NOT READY decision.
- Acceptance: no production-readiness claim based solely on unit tests, /health or historical evidence.

## MOS-S010 — Concurrency work remains separate
- Status: HOLD
- Outcome: N=2 real probe is not part of call-readiness queue.
- Activation: only after the controlled-call path is accepted and owner separately authorises the chargeable concurrency probe.
