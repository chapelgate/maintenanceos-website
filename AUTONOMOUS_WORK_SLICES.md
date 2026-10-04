# MaintenanceOS Website — Autonomous Work Slices

## Execution contract

This file is the **authoritative executable queue** for the autonomous worker. Strategic missions, roadmaps, problem histories and commercial plans are context only.

Statuses: `OPEN | IN_PROGRESS | PASS | BLOCKED | HUMAN_BLOCKED | HOLD`.

Rules:
1. Execute exactly one slice at a time. Multiple slices may be `OPEN`; only one may be `IN_PROGRESS`.
2. Select the highest-priority eligible `OPEN` slice. File order is the default priority. A slice is eligible when every **genuine** safety/data dependency needed for its outcome or acceptance is satisfied.
3. `Depends on` must represent a real requirement, not mere sequencing. Never bypass a human, safety, production, legal, spend, credential, destructive-action or project-specific gate.
4. Before changing anything, reproduce or prove the gap. Prefer **ZERO CODE → REUSE → CONFIGURE → smallest safe code**. Planning, rereading, review and status text alone are not progress.
5. If an attempt produces no measurable delta, change method. Exhaust safe materially different alternatives before marking `BLOCKED`, and record the blocker once.
6. A `BLOCKED` or `HUMAN_BLOCKED` slice must not stall unrelated work. Immediately select the next eligible `OPEN` slice. If none exists, promote the highest-priority `HOLD` slice whose genuine dependencies are satisfied.
7. Use `HUMAN_BLOCKED` only when a unique human action is genuinely required after authorised alternatives are exhausted. Keep the exact owner action in the existing human-blocker register; do not manufacture human blockers.
8. Mark `PASS` only when the stated acceptance evidence passes. A commit, build, deployment or unit test is not acceptance unless the slice explicitly says it is.
9. **Goal Lock:** the worker may decide **HOW** to satisfy the assigned outcome but may not broaden, reinterpret, replace or extend **WHAT** the outcome is. No unsolicited refactors, redesigns or speculative optimisation.
10. Add no new service, queue, database, router, scheduler, watchdog, supervisor, model router, control plane, second harness or multi-agent swarm. Continue autonomously until no eligible independent work remains; then surface one consolidated genuine-blocker report.

## Evidence basis for this slicing pattern

- Anthropic, *Building Effective AI Agents*: use workflow decomposition/sequential patterns where work can be cleanly separated; match architecture complexity to business value. https://resources.anthropic.com/building-effective-ai-agents
- OpenAI, *A practical guide to building agents*: agent runs need explicit exit conditions; set failure/retry thresholds; start simple and add complexity only when justified. https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/
- Microsoft, *Reduce autonomous agentic AI risk*: inadequate task adherence is a known agent risk; define clear boundaries and apply least action plus deterministic controls. https://learn.microsoft.com/en-us/security/zero-trust/sfi/manage-agentic-risk

Reviewed: 2026-10-03.

## Parent mission — NOT EXECUTABLE
Keep the working public website truthful and stable while completing Scanner V2 as an additive, rollback-safe capability. The golden MaintenanceOS phone line is out of scope.

## Ordered slices

## MOSWEB-S001 — Reconcile stale scanner problem statuses
- Status: OPEN
- Outcome: MASTER_PROBLEM_LOG no longer presents already live-closed CREATE-004/005/006/007 as current executable work.
- Acceptance: current closure evidence is preserved; no product code change.

## MOSWEB-S002 — Scanner V2 Stage 11 UI states
- Status: HOLD
- Depends on: MOSWEB-S001 PASS
- Outcome: implement only Stage 11 operational UI states from the existing Scanner V2 plan.
- Acceptance: Discovering/Crawling/Indexing/Complete/Partial/Failed states are represented; PARTIAL cannot appear fully learned; V2 remains feature-gated.

## MOSWEB-S003 — Stage 11 deterministic acceptance
- Status: HOLD
- Depends on: MOSWEB-S002 PASS
- Outcome: tests for progress counts, unresolved count, last scan, completeness label and safe source viewer behaviour if present.
- Acceptance: focused tests PASS without weakening Scanner V1 or security limits.

## MOSWEB-S004 — Stage 11 full regression
- Status: HOLD
- Depends on: MOSWEB-S003 PASS
- Outcome: run existing full repo/build/mobile/security gates.
- Acceptance: all required gates PASS; V1 production path unchanged.

## MOSWEB-S005 — Stage 12 deterministic fixture gate
- Status: HOLD
- Depends on: MOSWEB-S004 PASS
- Outcome: run the existing Stage 12 step 1 only.
- Acceptance: deterministic fixture suite passes on exact candidate.

## MOSWEB-S006 — Stage 12 V1 + real-site canary battery
- Status: HOLD
- Depends on: MOSWEB-S005 PASS
- Outcome: run the already-defined V1 regression and bounded real-site canaries without touching telephony.
- Acceptance: Alley Gates, Express Gas, Forum Housing plus plan-defined additional conventional/JS-heavy sites meet recorded criteria; failures become individual repair slices.

## MOSWEB-S007 — Mobile deep-question acceptance
- Status: HOLD
- Depends on: MOSWEB-S006 PASS
- Outcome: one mobile browser preview battery proves deep-page retrieval/source grounding.
- Acceptance: supported answers cite/retrieve correct source; unsupported questions fail honestly; no production lead/save side effect unless test explicitly uses safe fixture path.

## MOSWEB-S008 — Exact deployed-SHA freeze
- Status: HOLD
- Depends on: MOSWEB-S007 PASS
- Outcome: complete remaining Stage 12 full gates, exact deployed SHA readback and freeze evidence.
- Acceptance: V2 canary is proven stable before changing rollback assumptions; golden line untouched.
