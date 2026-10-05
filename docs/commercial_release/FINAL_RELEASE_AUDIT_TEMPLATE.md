# CR-17 — Final Commercial-Release Evidence Audit Template

Status: PREPARED / NOT EXECUTED

This template is used only after CR-16 design-partner pilot evidence exists. Preparing the template does not constitute a release audit, READY verdict or launch approval.

## Audit rule

Every release claim must resolve to objective evidence for the exact candidate being approved.

Allowed states:

- PASS — evidence proves the requirement for the exact candidate/configuration.
- FAIL — evidence disproves the requirement or shows an unresolved defect.
- NOT TESTED — required evidence does not exist.
- NOT APPLICABLE — reason is documented and independently reviewable.

Missing evidence is never converted to PASS.

## Candidate identity

Record:

- product Git SHA;
- deployed build/image identity;
- website Git SHA;
- voice model/provider/configuration;
- deterministic policy/config versions;
- identity configuration;
- retention configuration;
- commercial market scope;
- telephone/provider routing identity;
- database/deployment identity;
- rollback point;
- pilot customer/tenant scope.

If evidence belongs to a different candidate, mark the affected row NOT TESTED until reproduced or justified as invariant.

## Release evidence matrix

| Gate | Required evidence | Exact evidence/result | Status |
|---|---|---|---|
| LUMI result and candidate freeze | final benchmark/job evidence and frozen model/app/config manifest |  |  |
| Controlled phone acceptance | exact-candidate PSTN acceptance and rollback proof |  |  |
| Deterministic safety | critical latch, human clearance, evidence-authority tests |  |  |
| Awaab/social-housing scope | live statutory timing evidence if that market is enabled |  |  |
| Tenant isolation | independent and internal evidence across all consequential surfaces |  |  |
| Production identity | real IdP/session/MFA/RBAC/revocation evidence |  |  |
| Data lifecycle | approved retention configuration and live hold/export/erasure evidence |  |  |
| Database/recovery | production-like backup/restore evidence and measured recovery objectives |  |  |
| Logging/incident response | monitoring, redaction, alert and tabletop evidence |  |  |
| Provider permissions | current provider rights/DPA/transfer/data-use register |  |  |
| Supply chain | SBOM/dependency/security evidence for frozen candidate |  |  |
| Brand/IP | professional retain/rename decision |  |  |
| Public/customer legal pack | professional approval of applicable documents |  |  |
| Website release | legal/company/accessibility/security gates |  |  |
| Independent security assessment | authorised report and retest evidence |  |  |
| Design-partner pilot | CR-16 entry, operational, incident, metric and exit evidence |  |  |
| Claims register | every public/product claim tied to current evidence |  |  |
| Open problem register | no hidden Critical/High release blocker |  |  |
| Human blockers | all release-critical human gates closed |  |  |
| Rollback | verified exact rollback path |  |  |

## Technical verification

Confirm independently:

- canonical source is the repository under audit;
- no legacy deployment copy is being mistaken for product source;
- current source tree is clean and expected;
- deterministic test suite is green on supported production platforms;
- release CI corresponds to the exact candidate SHA;
- no dependency/security gate is stale relative to candidate;
- commercial-release readiness remains fail closed unless runtime controls are actually integrated;
- no feature/config change after pilot invalidates the evidence;
- golden/live telephone state matches the approved release decision.

## Product-safety review

The final audit must verify that:

- AI has not acquired authority to clear safety or perform unapproved consequential actions;
- human-review latches remain authoritative;
- a provider/model failure cannot become a false affirmative outcome;
- action evidence remains required before claiming successful external action;
- tenant isolation applies to new release controls as well as existing product flows;
- any social-housing claim matches the actual Awaab runtime evidence.

## Legal/privacy/commercial review

Confirm the release territory and market match the approved documents and processing design.

Check:

- contracting entity and statutory company details;
- privacy/cookie/terms version;
- MSA/DPA/SLA/security schedules;
- subprocessors/transfers;
- DPIA and any customer-specific variation;
- approved retention policy;
- AI/transcription/call notices;
- insurance/procurement evidence where applicable;
- brand/IP clearance;
- accessibility obligations for the launched surfaces.

The auditor does not replace professional legal sign-off. Professional gate evidence must already exist.

## Independent security review

Confirm:

- exact candidate assessed;
- scope limitations do not invalidate the intended launch;
- no unresolved Critical or High finding;
- required retests passed;
- accepted lower findings have owner, rationale and target date;
- tenant/safety/authentication findings are not silently risk-accepted without owner review.

## Pilot evidence review

Confirm CR-16:

- started only after entry gates passed;
- used the frozen candidate or documented/retested changes;
- stayed within approved customer/market/data scope;
- retained human oversight;
- recorded incidents and changes;
- covered every material workflow/failure mode needed for confidence;
- met its exit criteria;
- can offboard/export/delete as contracted.

Do not equate high call count with evidence quality. Coverage and unresolved uncertainty matter more than volume.

## Claims reconciliation

For every proposed public/customer statement, record:

| Proposed claim | Evidence source | Candidate/version | Allowed wording | Status |
|---|---|---|---|---|

Reject:

- unsupported reliability/accuracy percentages;
- unsupported security/compliance certification claims;
- unsupported legal-compliance claims;
- claims based only on synthetic tests when wording implies real production evidence;
- claims based on a superseded model/config/runtime;
- "worldwide compliant" language without jurisdiction-specific approval.

## Final problem sweep

Review:

- Control Room open tasks;
- master release problem register;
- incidents;
- security findings;
- human-gate register;
- website problem register;
- LUMI problem/evidence logs;
- pilot incident/change register.

Every unresolved item must be classified as:

- release blocker;
- accepted residual risk;
- non-release future work;
- duplicate/superseded.

No unknown/unclassified open item is permitted in a READY decision.

## Final verdict

Only two verdicts are permitted:

### READY FOR COMMERCIAL RELEASE

Requires every mandatory gate PASS, no unresolved Critical/High blocker, no material NOT TESTED item, and a reconciled exact candidate.

The audit records residual risks but does not itself launch the product. CR-H05 remains the final owner approval.

### NOT READY FOR COMMERCIAL RELEASE

List each blocking row and the exact evidence/action required to close it. Do not create unrelated work.

## Audit evidence record

Record:

- audit date/time;
- auditor/reviewer identity;
- exact candidate SHA/config;
- evidence files/URLs/run IDs;
- CI/test IDs;
- unresolved risks;
- final verdict;
- next permitted action.

## Freeze rule

If READY is reached, freeze the audited candidate and evidence set before CR-H05. Any subsequent material code/config/provider/policy change returns affected gates to NOT TESTED until revalidated.
