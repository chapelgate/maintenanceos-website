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
- Status: PASS
- Outcome: current main passes the existing non-live unit/integration/security regression needed for pre-call work.
- Acceptance: exact run evidence recorded; no carrier call and no phone-route mutation.
- Evidence: authoritative main SHA `7059ee2e5993660d02d8776320afbdf4304eb2e5`; MaintenanceOS Cloud CI run `37550778941`, job `primary-test`, completed SUCCESS on 2026-10-07. Passed checkout, runner policy, committed-secret rejection, dependency consistency, source compilation, deterministic regression, bounded TLS/WSS transport probe, and Python 3.12 compatibility regression. No carrier-call step was executed by this evidence run.

## MOS-S002 — Reconcile open call-defect fixes
- Status: PASS
- Depends on: MOS-S001 PASS
- Parent: tracker steps 3 and 5
- Outcome: one matrix maps each previously observed live-call defect to current code fix + automated coverage + missing carrier evidence.
- Acceptance: no defect is declared fixed from memory.
- Evidence matrix (repository evidence only; no live-fix claim inferred from memory):
  - Live Gemini greet-then-stall after caller speech (2026-09-30): current source contains the bounded stalled-turn recovery path and its focused regression coverage in `gemini_voice.py` / `tests/test_gemini_latency_tuning.py`; historical Linux verification run `36716049092` passed the focused and deterministic regressions. **Missing carrier evidence:** a controlled real test-number call must still prove the current deployed runtime no longer stalls.
  - Post-call email missing/poor caller ANI and operational structure (2026-09-30): current `call_notifications.py` reads both provider caller ANI and called number from CallSid and has canonical automated coverage in `tests/test_call_notifications.py`. Historical current-main reconciliation run `36762089062` passed focused/full/TLS-WSS/Python-3.12 gates. **Missing carrier evidence:** current deployed test-number call must prove provider metadata and received email end-to-end.
  - CG-000082 noisy-STT/job-card regression (2026-10-06): canonical source contains bounded gate-number/noisy-STT recovery, Warwick Road/keeper/open-gate extraction and anti-fabrication rules; `tests/test_call_notifications.py` plus `tests/test_post_call_email_sync.py` cover canonical behaviour and prevent stale worker-mirror redeployment. The problem log records focused canonical 46 PASS and worker-mirror 44 PASS; the repair is merged on current main. **Missing carrier evidence:** one controlled test-number call must prove deployed email output; no golden-line inference is made.
  - Routine transfer/UK emergency-language regressions: `tests/test_live_defect_regressions.py` proves routine requests do not trigger emergency transfer, genuine emergencies do, UK 999/never-911 policy is present, and transfer does not inject a second TTS voice. Current-main Cloud CI run `37550778941` passed the deterministic suite. **Missing carrier evidence:** transfer/no-answer behaviour remains a controlled-call acceptance item.
- Boundary: source/automated coverage is reconciled; no item above is declared live-fixed until its stated carrier evidence passes.

## MOS-S003 — Prove runtime/persistence pre-call requirements
- Status: PASS
- Depends on: MOS-S002 PASS
- Parent: tracker step 7
- Outcome: finite runtime/persistence evidence needed before a controlled call.
- Acceptance: existing non-phone verification passes; no live call.
- Evidence: current-main Cloud CI run `37550778941` passed the deterministic Python 3.13 suite, bounded TLS/WSS transport probe and Python 3.12 compatibility suite on authoritative source SHA `7059ee2e5993660d02d8776320afbdf4304eb2e5`. Existing regression coverage includes signed inbound persistence, idempotent stream callbacks/error recording, media start/stop with persisted `CallSession.ended_at`, schema reachability/compatibility and migration preservation, and pilot runtime persistence with DB-loss/file-mirror recovery plus fail-closed call-limit/abort guards. This is non-phone evidence only; it does not claim deployed carrier readiness.

## MOS-S004 — Re-establish external environment/readiness
- Status: BLOCKED
- Blocker (2026-10-08): live Twilio webhook and actual serving host not yet verified; historical DO production/USH droplets absent; rollback host and Render test services are not proven production. Do not touch golden phone route.
- Depends on: MOS-S003 PASS
- Parent: tracker step 8
- Outcome: one read-only/current environment and readiness record for the actual intended runtime.
- Acceptance: exact service/config facts are current; no safety flag is enabled merely to inspect state.

## MOS-S005 — Build pre-call acceptance checklist
- Status: HOLD
- Depends on: verified production endpoint for final carrier-specific details; prepare offline checklist independently under MOS-S011
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


## Overnight commercial readiness expansion — independent of S004; one canonical queue
All slices below are documentation, analysis, static-code/test, or offline evidence work until the actual live host is proven. Do not claim live PASS. Do not create another queue, controller, worker type, service or infrastructure. Reuse existing repository, tests, CI and authorised workers. Do not modify the golden voice, carrier, routing, production deployment or secrets. All new slices are HOLD except MOS-S011. The canonical persistent worker advances one slice at a time; independent external analysis may run concurrently but cannot self-promote queue states. For each slice deliver a committed artifact, reproducible evidence, PASS/HOLD, and exact human blockers. No invented competitor capabilities or legal certification.

## MOS-S011 — Competitor and market benchmark
- Status: OPEN
- Outcome: compare Moneypenny, BT AI Receptionist, Hey Jodie, Dialzara and relevant UK alternatives on verified current primary-source features, call accuracy, interruptions, escalation, reporting, integrations, privacy, trial/onboarding and price; identify realistic differentiated positioning.
- Acceptance: sourced dated matrix, no fabricated scores, measurable target specification and gap register. No unsupported 'number one' claim.

## MOS-S012 — Legal/privacy readiness pack
- Status: HOLD
- Outcome: draft UK GDPR/ICO assessment: roles, lawful bases, AI/recording disclosure, privacy notice, retention, DSAR, DPIA screening, subprocessors/transfers, DPA, breach plan, PECR applicability, consumer/business terms and legal-review checklist.
- Acceptance: document pack with legal references, data-flow inventory, unresolved counsel decisions clearly HUMAN_BLOCKED; no assertion of legal approval.

## MOS-S013 — Security threat model and access controls
- Status: HOLD
- Outcome: map authentication, USH/Twilio trust, webhook validation, least privilege, prompt injection, PII redaction, encryption, retention, dependency vulnerabilities, incident handling and backups.
- Acceptance: static findings with reproducible proof and bounded safe fixes; no credential reads or production access changes.

## MOS-S014 — Call taxonomy and conversation acceptance
- Status: HOLD
- Outcome: exhaustive scripted tests for repair, quote, keys, council, wrong number, silence, noisy STT, interruptions, ambiguous names/addresses, postcode, gate number, caller ANI, transfer requests and graceful goodbye.
- Acceptance: runnable offline deterministic tests and pass/fail matrix; golden voice untouched.

## MOS-S015 — Transcript, job card and email fidelity
- Status: HOLD
- Outcome: reconcile transcript to structured fields, correct negation (will/won't), no invented identity/address, called/calling numbers, consent, uncertainty and human review flags.
- Acceptance: reproduce CG-000084-style failures using synthetic redacted fixtures and focused regressions; no real personal data committed.

## MOS-S016 — Reliability, latency and fallback
- Status: HOLD
- Outcome: offline bounded stress, timeout, interruption, retry/idempotency, STT/LLM failure, duplicate callback, database outage, provider error and safe human fallback.
- Acceptance: measurable CI results, latency/error budget and clear limitations; no live calls.

## MOS-S017 — Accessibility and inclusive UK speech
- Status: HOLD
- Outcome: assess accents, speech impairment, dyslexia-friendly written follow-ups, hearing accessibility, multilingual handling and alternative human contact.
- Acceptance: evidence-backed accessible scripts and test cases, no invented demographic performance.

## MOS-S018 — Product configuration and onboarding
- Status: HOLD
- Outcome: reuse existing configuration to define customer setup, FAQs, call categories, working hours, escalation, number forwarding and reversible activation.
- Acceptance: operator guide and sandbox/static validation; no customer provisioning or routing changes.

## MOS-S019 — Commercial pricing and unit economics
- Status: HOLD
- Outcome: cost model for Twilio, voice/STT/LLM, compute, support, taxes, UK competitors, 70-call/month pilot and scale; transparent plans, fair-use and gross margin.
- Acceptance: formulas with sourced inputs and sensitivity ranges; no invented API costs or financial commitments.

## MOS-S020 — Sales, marketing and website handoff
- Status: HOLD
- Outcome: credible positioning, competitor comparison, homepage copy, demo script, procurement evidence, FAQs, SEO and no-unproven-claims rules; website owned by separate factory.
- Acceptance: handoff only, no duplicate website worker, no publication without approval.

## MOS-S021 — Operations, support and SLA
- Status: HOLD
- Outcome: runbook for service monitoring, incidents, backup/restore, call quality audit, ticket handling, customer support, escalation and change management.
- Acceptance: executable tabletop checklist and owner-facing SOP; no new monitoring service.

## MOS-S022 — Procurement and assurance pack
- Status: HOLD
- Outcome: UK public-sector supplier readiness, security questionnaire, accessibility, data-processing terms, insurance/certification gap register, modern slavery applicability and evidence wallet reuse.
- Acceptance: evidence-based responses and explicit NOT CERTIFIED where applicable.

## MOS-S023 — QA, regression and release evidence
- Status: HOLD
- Outcome: consolidate AT-01..AT-16, static security, dependency/license audit, test coverage, versioned release notes, rollback readiness and sign-off matrix.
- Acceptance: reproducible CI links and explicit live-unverified entries; no false PASS.

## MOS-S024 — Customer trial and conversion readiness
- Status: HOLD
- Outcome: trial terms, onboarding checklist, demo/sandbox flow, support boundaries, pilot success metrics, feedback, billing and cancellation journey.
- Acceptance: draft end-to-end dry-run with owner/legal/production gates explicit.

## MOS-S025 — Independent adversarial release audit
- Status: HOLD
- Outcome: try to disprove readiness against best competitors, abuse cases, legal gaps, failed speech capture, costs and operational risk; prioritised defects.
- Acceptance: evidence-linked P0/P1/P2 register, no self-awarded readiness.

## MOS-S026 — Final consolidated owner blocker and launch dossier
- Status: HOLD
- Outcome: consolidate completed independent work, exact owner decisions, live S004/S006/S007 gates, unresolved defects and market release criteria.
- Acceptance: single concise GO/NO-GO dossier, no declaration of commercial release without live and legal gates.


## MOS-S005 offline draft — NOT ACCEPTED / NO CARRIER AUTHORISATION
- Preconditions: identify verified Twilio test-number webhook and serving host, match deployment SHA to tested source, confirm isolation from golden voice, obtain explicit owner one-call window and safe evidence handling.
- Single scripted test: repair request; synthetic gate 625 and address 1 Test Road, CH45 9AA; say “keeper will not go into lock, gate remains open”; interrupt and correct gate to 626; request readback; finish call. Use no real resident data.
- PASS evidence required: correct test routing, no stall or unrequested transfer, correct gate 626, negation preserved, no invented identity, called/caller/callback separated, one durable job and one email per CallSid, safe goodbye, unchanged golden route. Mark each PASS/FAIL/NOT OBSERVED with redacted CallSid and timestamp.
- Stop immediately on wrong route, unapproved transfer, golden voice change, or privacy concern; do not retry without new owner authorisation. Close window after one call and record source SHA, provider evidence and failure list.
- This is checklist preparation only. MOS-S005 remains HOLD until live endpoint and rollback/stop conditions are verified; MOS-S006 remains HUMAN_BLOCKED; no live call was made.
