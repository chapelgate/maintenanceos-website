# CR-16 — UK Design-Partner Pilot Pack

Status: PREPARED / NOT AUTHORISED TO START

This pack defines the bounded commercial proof between release hardening and general availability. It does not authorise customer onboarding, real resident data, live call routing, contracting or public launch.

## Pilot objective

Prove that the exact frozen MaintenanceOS release candidate can operate safely and usefully for a small UK B2B design partner under real operational conditions, with human oversight, complete evidence, reversible rollout and no expansion of AI authority.

The pilot is not a feature-development programme. New feature requests are recorded separately and do not change the frozen pilot candidate unless they correct an accepted blocker.

## Pilot market

Default initial scope:

- UK B2B property/maintenance operator;
- non-social-housing use unless the England social-housing/Awaab runtime gate has separately passed;
- inbound maintenance intake and controlled operational workflow only;
- no payments, refunds, compensation, client-money handling or autonomous financial authority;
- no automatic contractor dispatch unless an already-approved deterministic rule explicitly allows it;
- human authority retained for safety and consequential exceptions.

England social-housing customers remain excluded until the commercial-release readiness profile confirms the applicable Awaab runtime is implemented and independently tested.

## Mandatory entry gates

Do not start the pilot until all applicable gates are PASS with evidence:

1. LUMI evaluation complete and exact candidate frozen.
2. Controlled PSTN/voice acceptance passed on that exact candidate.
3. CR-13 commercial-release integration accepted.
4. CR-14 factual customer trust pack complete.
5. CR-15 independent security-assessment scope complete.
6. CR-H02 professional brand/name decision complete.
7. CR-H03 UK technology/data counsel approval complete.
8. CR-H04 independent security assessment and required retest complete.
9. DPIA/data-flow review approved for the intended pilot processing.
10. Final customer contract/DPA/SLA/security schedules approved.
11. Production identity and data-lifecycle runtime controls are testable and pass the commercial-release readiness gate.
12. Recovery/rollback evidence is current for the exact candidate.
13. Customer-specific implementation/data-flow differences are documented before real data is accepted.

A missing gate is a NO-GO, not a waiver by silence.

## Candidate freeze

Record before onboarding:

- application Git SHA;
- deployment/image identity;
- voice model/provider/configuration;
- deterministic policy/config versions;
- identity configuration;
- retention configuration;
- commercial market scope;
- customer/tenant configuration;
- rollback point.

Changes during the pilot require classification:

- security/safety defect fix: permitted only through controlled test/re-acceptance;
- configuration correction: record and verify;
- feature request: defer outside pilot unless it is a release blocker.

## Design-partner selection

Choose a customer who can provide:

- a named operational owner;
- a named privacy/data contact;
- a named escalation contact;
- a representative but bounded maintenance workflow;
- willingness to run human oversight and supply structured feedback;
- agreement not to treat the pilot as an emergency-service replacement.

Avoid a first pilot whose complexity would hide product quality behind integration work.

## Onboarding evidence

Before accepting real operational use, record:

- signed MSA/DPA and applicable schedules;
- confirmed controller/processor roles;
- subprocessor disclosure;
- customer tenant identifier;
- authorised staff/users/roles;
- retention policy selected from the approved policy;
- permitted channels;
- permitted categories/workflows;
- emergency and human-escalation procedure;
- support contact;
- data-import decision;
- deletion/export/offboarding procedure;
- customer confirmation of pilot limitations.

## Operating boundaries

During the pilot:

- one frozen execution authority;
- one canonical work queue;
- human review remains authoritative;
- AI may gather, structure, classify and suggest only within the accepted policy;
- no silent expansion of model authority;
- no unapproved integrations;
- no customer-to-customer data reuse;
- no training/fine-tuning on customer data unless separately approved and contracted;
- no public claim that the product is generally available.

## Pilot acceptance evidence

Measure outcomes that demonstrate the product rather than vanity volume.

### Safety and control

Evidence must show:

- critical-safety latches behave correctly;
- required human review is not bypassed;
- tenant isolation remains intact;
- identity/session controls work in real operations;
- confirmed actions require confirmed evidence;
- provider failures remain visible failures;
- rollback and recovery procedures remain available.

### Service quality

Track:

- successful intake completion;
- caller abandonment or failed interaction;
- correct capture of caller/contact/property/job details where applicable;
- correct categorisation/escalation against the accepted rules;
- successful and failed provider actions;
- human-review rate and reasons;
- response latency relevant to call usability;
- repeat/contact-back caused by product error.

Do not manufacture extra calls merely to increase sample size. Coverage should be scenario-driven: every material accepted workflow and failure mode must receive real pilot evidence, with additional volume only where needed to resolve uncertainty.

### Operational quality

Track:

- time to human intervention;
- unresolved work items;
- duplicate/replayed event behaviour;
- support incidents;
- customer-reported errors;
- data correction requests;
- deletion/export requests;
- onboarding/offboarding effort.

### Commercial quality

Record:

- customer value achieved;
- work avoided/reduced;
- support burden;
- configuration burden;
- objections raised by procurement/privacy/security teams;
- integration requests that are true blockers versus optional features;
- willingness to continue/pay after pilot.

No marketing claim should exceed the evidence actually observed.

## Incident and stop conditions

Pause the affected pilot path immediately for:

- suspected cross-tenant access;
- incorrect critical-safety clearance;
- real personal-data exposure outside intended recipients;
- material authentication/authorization failure;
- false representation that a consequential real-world action succeeded;
- uncontrolled provider/cost behaviour;
- inability to preserve required evidence;
- inability to restore/rollback the affected service safely.

A contained non-safety defect may remain in pilot only when the owner, customer and applicable professional advisers accept the bounded risk and a repair/retest plan exists.

## Support model

During pilot:

- one named Chapelgate operational owner;
- defined customer support route;
- incidents recorded in the canonical problem register;
- product changes recorded against the exact candidate;
- no undocumented manual database correction;
- customer-facing incident communication uses verified facts only.

## Daily/weekly review

The pilot team should review evidence at a cadence proportionate to actual activity, without creating meetings or reports when nothing changed.

Review:

- new incidents;
- safety/human-review events;
- failed provider actions;
- unusual latency/availability;
- customer feedback;
- unresolved data/privacy requests;
- change requests;
- release-gate regression.

## Exit criteria

Pilot can be proposed for successful closure only when:

- no unresolved Critical/High security issue exists;
- no unresolved safety-control defect exists;
- no unexplained cross-tenant event exists;
- no material privacy/data-lifecycle failure exists;
- all required representative workflows have real evidence;
- recovery/rollback remains proven;
- customer offboarding/export/deletion can be performed as contracted;
- the customer accepts the operational outcome;
- open Medium/Low issues have owners and disposition;
- the final CR-17 audit can reconcile every launch claim to evidence.

## Failure outcome

A pilot that does not meet exit criteria is not "mostly passed." It returns to release hardening with:

- exact failed gate;
- reproduction evidence;
- smallest repair;
- retest evidence;
- updated candidate SHA.

## Pilot completion evidence pack

Archive:

- exact candidate/config manifest;
- signed entry-gate checklist;
- customer contract/DPA references;
- DPIA/customer-processing differences;
- operational metrics;
- scenario coverage;
- incident/problem register;
- change log;
- recovery/rollback evidence;
- customer acceptance/feedback;
- offboarding/data-handling evidence where applicable;
- unresolved risk list.

## Transition to CR-17

Completion of this pack does not mean general availability.

CR-17 independently checks the pilot evidence, exact current source/runtime, legal/security gates, open problems and product claims. General commercial release remains disabled until that audit passes and CR-H05 receives explicit owner approval.
