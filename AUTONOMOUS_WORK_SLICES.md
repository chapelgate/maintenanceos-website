# MaintenanceOS Website — Autonomous Work Slices

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
11. **NO RENDER — ESTATE RULE.** Do not use Render.com for deployment, hosting, fallback, preview, worker execution, or any new configuration. Existing historical `render.yaml` references are not an authorised deployment path. Reuse already-approved Chapelgate infrastructure only.

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
- Acceptance: PASS — closure evidence remains in place; only stale headline statuses were reconciled.

## MOSWEB-S002 — Scanner V2 Stage 11 UI states
- Status: PASS
- Depends on: MOSWEB-S001 PASS
- Outcome: implement only Stage 11 operational UI states from the existing Scanner V2 plan.
- Acceptance: PASS — Discovering/Crawling/Indexing/Complete/Partial/Failed are represented and PARTIAL cannot present as fully learned; V2 remains feature-gated.

## MOSWEB-S003 — Stage 11 deterministic acceptance
- Status: PASS
- Depends on: MOSWEB-S002 PASS
- Outcome: tests for progress counts, unresolved count, last scan, completeness label and safe source viewer behaviour if present.
- Acceptance: PASS — recorded Stage 11 focused acceptance passed.

## MOSWEB-S004 — Stage 11 full regression
- Status: PASS
- Depends on: MOSWEB-S003 PASS
- Outcome: run existing full repo/build/mobile/security gates.
- Acceptance: PASS — Stage 11 evidence records 419/419 tests, 17/17 accessibility and 30/30 build routes with V1 production unchanged.

## MOSWEB-S004A — Modern rendered-site market-parity coverage
- Status: PASS
- Depends on: MOSWEB-S004 PASS
- Outcome: close only the demonstrated current-market public-site coverage gaps before Stage 12: bounded lazy-loaded/scroll content, open Shadow DOM content and same-origin iframe discovery.
- Acceptance: PASS on merged main SHA `5993683d8d1d61a427e5eb07cd3e0e59829eb0a7`; exact candidate locally passed 425/425 tests, 17/17 accessibility, lint, TypeScript, 30/30 build routes, viewport smoke and 390x844 mobile interactive acceptance. Golden line untouched.

## MOSWEB-S005A — Stage 12 deterministic whole-site discovery fixture
- Status: PASS
- Depends on: MOSWEB-S004A PASS
- Outcome: prove the existing deterministic fixture reaches 100+ sitemap pages plus link-only deep content with exact URL accounting.
- Acceptance: PASS on main SHA `51312b8693b2951919d49b6b8bf9a2f88a78399e` — exact named fixture `integrated discovery exhausts 100+ sitemap pages and a link-only deep page` passed 1/1; 122 URLs fetched, including 120 sitemap pages plus root and link-only deep content, with no hidden ceiling.

## MOSWEB-S005B — Stage 12 modern-DOM fixture
- Status: PASS
- Depends on: MOSWEB-S005A PASS
- Outcome: prove lazy-loaded content, open Shadow DOM text/links and same-origin iframe discovery enter the normal V2 corpus/frontier.
- Acceptance: PASS — deterministic real-Playwright acceptance proved lazy-loaded text and open Shadow DOM text reached the normal extracted corpus and BM25 retrieval; same-origin iframe and Shadow DOM links re-entered the validated frontier; 2 observed requests, 0 blocked-request escapes.

## MOSWEB-S005C — Stage 12 document/deep-knowledge fixture
- Status: PASS
- Depends on: MOSWEB-S005B PASS
- Outcome: prove linked PDF/TXT/CSV and deep-page facts are retrievable with exact source provenance.
- Acceptance: PASS on main SHA `46d186f547ee7ed752cc4cb0eeef2a8c1d5c5d04` — 5/5 focused tests passed for TXT, CSV, PDF-only grounded facts, 10 deep-site source-backed questions and honest unsupported-question not_found.

## MOSWEB-S006A — V1 compatibility regression
- Status: OPEN
- Depends on: MOSWEB-S005C PASS
- Outcome: prove the existing V1 production compatibility path remains unchanged before canaries.
- Acceptance: V1 scan/regression tests PASS; Scanner V2 remains feature-gated; no telephony change.

## MOSWEB-S006B — Alley Gates real-site canary
- Status: HOLD
- Depends on: MOSWEB-S006A PASS
- Outcome: run a bounded V2 read-only canary against alleygates.co.uk.
- Acceptance: record discovered/fetched/skipped/unresolved counts; prove at least three non-homepage facts and five site-specific grounded questions; unknown question fails honestly.

## MOSWEB-S006C — Express Gas real-site canary
- Status: HOLD
- Depends on: MOSWEB-S006B PASS
- Outcome: run the same bounded read-only V2 canary against expressgasdelivery.com.
- Acceptance: same evidence contract as MOSWEB-S006B.

## MOSWEB-S006D — Forum Housing real-site canary
- Status: HOLD
- Depends on: MOSWEB-S006C PASS
- Outcome: run the same bounded read-only V2 canary against forumhousing.co.uk.
- Acceptance: same evidence contract as MOSWEB-S006B, including the previously difficult site path.

## MOSWEB-S006E — Additional conventional-site canary
- Status: HOLD
- Depends on: MOSWEB-S006D PASS
- Outcome: run one bounded V2 canary against an ordinary multi-page public business site selected only for coverage diversity.
- Acceptance: same evidence contract as MOSWEB-S006B; no login, anti-bot bypass or mutation.

## MOSWEB-S006F — Additional JS-heavy-site canary
- Status: HOLD
- Depends on: MOSWEB-S006E PASS
- Outcome: run one bounded V2 canary against a public JS-heavy site to exercise safe render escalation.
- Acceptance: rendered facts/links enter normal validation and retrieval; no form submission, auth/CAPTCHA bypass or cross-origin crawl.

## MOSWEB-S007A — Mobile deep-question preview
- Status: HOLD
- Depends on: MOSWEB-S006F PASS
- Outcome: prove a 390x844 mobile preview can answer supported deep-site questions from V2 evidence.
- Acceptance: correct source-backed answers, zero runtime exceptions and zero lead/save side effect.

## MOSWEB-S007B — Mobile unsupported-question honesty
- Status: HOLD
- Depends on: MOSWEB-S007A PASS
- Outcome: prove unsupported mobile questions fail honestly rather than using stale/summary knowledge.
- Acceptance: not_found/explicit uncertainty; no invented source, number, service or policy.

## MOSWEB-S008A — Production V2 runtime reuse decision
- Status: HOLD
- Depends on: MOSWEB-S007B PASS
- Outcome: identify and prove the smallest existing approved Chapelgate runtime that can execute V2 resumably.
- Acceptance: REUSE ONLY; no new service/database/control plane; **NO RENDER**; golden phone runtime excluded; if no existing approved runtime satisfies requirements, record one blocker rather than creating infrastructure.

## MOSWEB-S008B — Feature-gated production canary cutover
- Status: HOLD
- Depends on: MOSWEB-S008A PASS
- Outcome: connect the existing /create scan path to V2 behind the existing explicit feature gate on the proven runtime.
- Acceptance: V1 remains rollback path; exact canary tests PASS before wider enablement; no telephony/provider credential change.

## MOSWEB-S008C — Exact deployed-SHA verification
- Status: HOLD
- Depends on: MOSWEB-S008B PASS
- Outcome: run full production/browser/security gates and read back the exact deployed application SHA.
- Acceptance: required gates PASS on the deployed candidate; public /create uses intended V2 canary path; no hidden V1 fallback when V2 reports COMPLETE.

## MOSWEB-S008D — Final freeze
- Status: HOLD
- Depends on: MOSWEB-S008C PASS
- Outcome: freeze the exact deployed SHA and acceptance evidence.
- Acceptance: rollback point recorded; Scanner V2 canary stable; golden phone line untouched; no Render usage.
