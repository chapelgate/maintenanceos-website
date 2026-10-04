# MaintenanceOS — Autonomous Work Slices

## Execution contract

This file is the **authoritative executable queue** for the autonomous worker. Strategic missions, roadmaps, problem histories and commercial plans are context only.

Statuses: `OPEN | IN_PROGRESS | PASS | BLOCKED | HUMAN_BLOCKED | HOLD`.

Rules:
1. **Exactly one executable slice exists at a time.** Across this file, at most one slice may be `OPEN` or `IN_PROGRESS`; every other unfinished slice is `HOLD`, `BLOCKED`, or `HUMAN_BLOCKED`.
2. The executable slice is the highest-priority eligible slice. File order is the default priority. A slice is eligible only when every **genuine** safety/data dependency needed for its outcome or acceptance is satisfied.
3. `Depends on` represents a real requirement, not mere sequencing. Never bypass a human, safety, production, legal, spend, credential, destructive-action, or project-specific gate.
4. Before changing anything, reproduce or prove the gap. Prefer **ZERO CODE → REUSE → CONFIGURE → smallest safe code**. Planning, rereading, review, diagnosis, heartbeat, commits, model calls, and status text alone are not progress.
5. If an attempt produces no measurable delta toward acceptance, change method. Exhaust safe materially different alternatives within existing limits before marking `BLOCKED`; record the blocker once.
6. When the executable slice reaches `PASS`, `BLOCKED`, or `HUMAN_BLOCKED`, the **persistent project worker** must re-read this same file and promote exactly one highest-priority eligible `HOLD` slice to `OPEN`. A bounded model/job run still stops at its own slice boundary; continuity happens by reusing the existing worker/controller, never by adding a scheduler, supervisor, queue, service, or second execution path.
7. A blocked slice must not stall unrelated eligible work. Use `HUMAN_BLOCKED` only when a unique human action is genuinely required after authorised alternatives are exhausted. Continue all independent eligible work first, then surface one consolidated human-blocker report.
8. Mark `PASS` only when the stated **substantive acceptance evidence** passes. A commit, build, deployment, file, heartbeat, or successful tool invocation is not acceptance unless the slice explicitly says it is.
9. **Goal Lock:** the worker may decide **HOW** to satisfy the assigned outcome but may not broaden, reinterpret, replace, or extend **WHAT** the outcome is. No unsolicited refactors, redesigns, cleanup, speculative optimisation, or adjacent work.
10. The worker's progress metric is **accepted slices**, not activity. Add no new service, queue, database, router, scheduler, watchdog, supervisor, critic, planner, model router, control plane, second harness, or multi-agent swarm. Continue autonomously until no eligible independent work remains.

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
