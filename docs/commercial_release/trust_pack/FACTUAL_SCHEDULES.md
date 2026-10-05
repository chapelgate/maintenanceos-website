# MaintenanceOS — Customer Trust Pack Factual Schedules

**Commercial-release task:** CR-14  
**Status:** FACTUAL SCHEDULES — NOT CONTRACTUAL OR LEGAL APPROVAL  
**Date:** 2026-10-05  
**Purpose:** provide one evidence-backed source pack for customer procurement, counsel and security review. Nothing in this file overrides the product source, final DPA/MSA/SLA, provider terms, or professional advice.

## Evidence basis

These schedules consolidate facts already proved in:
- `ARCHITECTURE.md`
- `SECURITY_DEPLOYMENT.md`
- `DATA_GOVERNANCE.md`
- `docs/commercial_release/DPIA_FACT_PACK.md`
- `docs/commercial_release/IAM_GAP_AND_REUSE_PLAN.md`
- `docs/commercial_release/DATA_LIFECYCLE_GAP_AND_REUSE_PLAN.md`
- `docs/commercial_release/SECURITY_AND_LICENCE_BASELINE.md`
- `docs/commercial_release/PROVIDER_RIGHTS_REGISTER.md`
- `docs/commercial_release/WEBSITE_LEGAL_SOURCE_GAPS.md`
- `docs/commercial_release/INCIDENT_OBSERVABILITY_MATRIX.md`
- `docs/commercial_release/ROLLBACK_RECOVERY_PROOF_PLAN.md`
- `docs/commercial_release/AWAAB_REQUIREMENTS_MATRIX.md`

Where those documents say GAP/UNKNOWN, this pack says GAP/UNKNOWN. It does not convert a design intention into an implemented control.

---

# Schedule A — Product and control model

MaintenanceOS is a multi-tenant maintenance-operations system. The canonical architecture places deterministic application rules—not the AI model—in control of:
- critical-safety latching and clearance;
- lifecycle transitions;
- tenant boundaries;
- consequential actions and action evidence;
- contractor/approval/invoice controls;
- feature/readiness gates.

AI may collect, structure and classify information. It does not have authority to independently clear critical safety, invent successful consequential actions, execute payments/refunds/compensation, or override deterministic tenant/lifecycle controls.

**Evidence:** `ARCHITECTURE.md`, `README.md`, `action_evidence.py`, `safety_controls.py`, `lifecycle.py`, `tenant_security.py`, `voice_policy.py`.

**Release limitation:** this architecture is not itself a warranty of legal compliance or service availability.

---

# Schedule B — Security control facts

## Implemented repository controls

| Control | Factual state | Evidence |
|---|---|---|
| Tenant-bound internal operations | Implemented | `tenant_security.py`, API/voice tenant tests |
| Constant-time internal bearer comparison | Implemented | `SECURITY_DEPLOYMENT.md`, API security code/tests |
| Twilio HTTP/WSS signature validation | Implemented fail-closed | `webhook_security.py`, provider tests |
| Bounded request/event payloads | Implemented | `ingress_security.py`, API tests |
| Security response headers | Implemented | `ingress_security.py` |
| Signed scoped/expiring resident/contractor links | Implemented | `security.py` |
| AI side-effect kill switch | Implemented | runtime control code/tests |
| Action-evidence/idempotency controls | Implemented | `action_evidence.py`, idempotency tests |
| Local SQLite backup hash/integrity/schema validation | Implemented | `backup_restore.py`, `tests/test_backup_restore.py` |
| Dependency vulnerability scan | Implemented in CI | `.github/workflows/security-ci.yml` |
| CycloneDX SBOM generation | Implemented in CI | `.github/workflows/security-ci.yml` |
| Dependabot for Python/Actions | Implemented | `.github/dependabot.yml` |
| Obvious committed-secret pattern checks | Implemented guardrail | Cloud/Security CI |
| GitHub Actions pinned to commit SHAs | Implemented in reviewed workflows | CR-07 baseline |
| Non-root production container assertion | Implemented in build/CI | Dockerfile / Cloud CI |
| Local structured redacted logging | Implemented but opt-in/local | `operational_logging.py` |

## Production gaps that must not be represented as complete

- individual production user IAM/MFA/SSO/session lifecycle is not yet integrated;
- managed PostgreSQL production backup/PITR/restore proof remains to be executed;
- central alerting/log aggregation and tamper-resistant audit storage are not implemented in the reviewed source;
- end-to-end request/call/work-order correlation is incomplete;
- independent penetration testing remains an external gate;
- frozen-release dependency/licence evidence must be retained for the exact release candidate.

**Evidence:** CR-05, CR-07, CR-09, CR-H04.

---

# Schedule C — Data categories and processing facts

## Data classes evidenced in source

- resident identity/contact and verification attempts;
- property address, access and emergency notes;
- repair descriptions, categories, safety flags, evidence and communications;
- call metadata, transcript/session events, model/provider identifiers and action evidence;
- contractor identity/contact, qualification/insurance, performance, quote/invoice/completion data;
- staff identity, role, approvals, overrides and security events;
- operational logs/telemetry using a redacted allowlist.

**Evidence:** `models.py`, `DATA_GOVERNANCE.md`, CR-03.

## Special/sensitive context

Resident health/vulnerability/circumstance information may become relevant to housing hazard assessment. The factual pack does not decide Article 9/legal basis or retention. Those decisions remain for the DPIA/counsel/customer role assessment.

## Audio/transcript distinction

Source proves transcript/session primitives and live audio transport to configured realtime providers. Source does **not** justify a blanket claim that all calls are audio-recorded.

Customer/public material must therefore distinguish:
- live audio processing;
- transcript persistence;
- audio recording, only if actually enabled;
- sample/demo transcript data.

---

# Schedule D — Provider and subprocessor factual register

The final customer schedule must include only providers active in the frozen candidate.

| Provider | Current/source role | Key release fact |
|---|---|---|
| Google Gemini API / Live | Primary configured realtime AI | UK-facing API client requires an eligible Paid Service route; exact billed project/config must be proved |
| OpenAI API / Realtime | Optional fallback/legacy voice | business/API data not used for training by default; exact project/retention/data-sharing configuration must be proved |
| Twilio | phone number/PSTN/webhooks/media | DPA/subprocessor/transfer facts recorded; exact recording/transcription/region config must be proved |
| DigitalOcean | current/intended hosting resources | DPA/UK transfer mechanisms recorded; exact active resources/regions/backups must be inventoried |
| Resend | outbound email path | US storage/transfer facts and DPA/subprocessor information recorded; exact account/plan/retention must be proved |
| LUMI/EuroHPC | synthetic R&D/evaluation only | **not** a production resident/customer data route under the current guardrail |

**Evidence and public source URLs:** `PROVIDER_RIGHTS_REGISTER.md`.

Final DPA/subprocessor schedule must not list a provider merely because source code supports it if the provider is disabled in the frozen production configuration.

---

# Schedule E — International transfer factual inputs

No legal transfer conclusion is made here.

Known factual inputs:
- Resend states Customer Data is stored in the United States and publishes UK transfer mechanisms.
- Twilio and DigitalOcean publish DPAs including UK international-transfer provisions.
- Google/OpenAI processing/location depends on the exact service/project/region/data-control configuration.
- LUMI remains synthetic-only under the current project rule.

**Closure requirement:** counsel maps the active frozen provider chain to the final transfer schedule and customer DPA. Runtime/account evidence must show the actual regions/features rather than relying only on provider terms.

---

# Schedule F — Retention, deletion, legal hold and rights handling

## Current implemented facts

- data is tenant-scoped across core application entities;
- a tenant-scoped work-order CSV export exists;
- local audit/evidence entities exist;
- local SQLite backup/restore exists;
- current source **does not** implement the complete production retention/deletion scheduler or legal-hold workflow.

## Required policy inputs

Retention values must be approved/configured by data class; this pack does not invent durations.

At minimum the final schedule must decide/configure treatment for:
- resident/contact;
- property/access notes;
- work orders and safety evidence;
- calls/transcripts/events;
- communications;
- contractor data;
- quotes/invoices;
- audit/action evidence;
- operational logs;
- backups.

## Required mechanics

CR-06 defines the reuse plan and CR-11/CR-13 own implementation/integration:
- configured per-class retention;
- deterministic expiry;
- legal/operational hold;
- export/correction/erasure selection;
- tenant-safe destructive actions;
- audit/safety preservation decisions;
- backup/restore replay of lifecycle decisions.

No customer promise about deletion timing should be made until those values/mechanics are approved and tested.

---

# Schedule G — Identity and access factual inputs

## Existing source facts

The current product has:
- `User` with tenant/client association, email, role and active state;
- application security primitives;
- tenant-bound service/API access;
- existing role/human-clearance concepts.

## Gap

The current internal service token/password-era model is not the final production user identity architecture.

CR-05 defines a configuration/reuse-first route toward:
- external identity subject/issuer;
- individual tenant membership;
- roles/least privilege;
- MFA assurance for privileged actions;
- session expiry;
- account disable/revocation;
- joiner/mover/leaver handling;
- per-user audit context.

CR-12/CR-13 must implement/integrate this before the control is marketed as production-ready.

---

# Schedule H — Availability, continuity and recovery facts

## Already proved locally

- SQLite backup is hashed and integrity/schema checked;
- tampered backup is rejected;
- restore refuses overwrite;
- restored bytes are verified;
- health/readiness profiles exist;
- provider ingress/runtime fail closed in several error states;
- worker retries/final failure/escalation are deterministic.

## Production proof still required

From `ROLLBACK_RECOVERY_PROOF_PLAN.md`:
- isolated managed-PostgreSQL backup restore;
- PITR if the selected tier provides/needs it;
- migration rollback rehearsal;
- exact application/runtime rollback;
- secret-free configuration rollback;
- workload-identity expiry/restart/revocation proof;
- actual measured service/data recovery times;
- independent review.

No RTO/RPO target is invented by this pack. Contractual targets must be chosen against measured evidence and customer/business requirements.

---

# Schedule I — Incident and support factual inputs

CR-09 proves local signals exist for:
- health/readiness;
- provider readiness/ingress failure;
- voice interruptions/provider failures;
- capacity rejection;
- worker failure/retry escalation;
- SLA escalation;
- backup verification;
- action evidence.

Production gaps:
- central alert delivery;
- formal acknowledgement/escalation routing;
- tamper-resistant central evidence;
- tested outage notifications;
- approved incident evidence retention.

Role placeholders used by CR-09 include:
- `<ROLE_PLATFORM_ON_CALL>`
- `<ROLE_VOICE_OPERATIONS_ON_CALL>`
- `<ROLE_SECURITY_ON_CALL>`
- `<ROLE_OPERATIONS_ON_CALL>`
- `<ROLE_OPERATIONS_MANAGER>`
- `<ROLE_RELEASE_MANAGER>`
- `<ROLE_DATA_PROTECTION_LEAD>`

Final customer SLA/support schedule must map these to real organisation roles/processes and approved service hours/targets. Do not invent 24/7 support or response times.

---

# Schedule J — AI transparency and human authority facts

Customer-facing factual statement that is supportable from source:

> MaintenanceOS uses AI to assist with maintenance intake and classification. Deterministic application controls and authorised people retain authority over critical safety and consequential business actions.

Final notices must additionally be configuration-specific:
- disclose AI interaction where required/approved;
- state whether live audio is processed;
- state whether audio is recorded;
- state whether a transcript is retained;
- identify purpose and relevant provider/data handling through the final privacy notice;
- describe human escalation/support without promising a transfer path that the frozen runtime does not provide.

The marketing site already distinguishes AI preview/demo behaviour from live telephony. Preserve that honesty until the production candidate is accepted.

---

# Schedule K — Housing / Awaab factual readiness

For England social housing:
- CR-04 contains the source-backed Phase 1/Phase 2 clock matrix;
- CR-10 implements an isolated deterministic policy core;
- shared workflow/data integration remains CR-13;
- AI must not replace professional judgement;
- social-housing/Awaab marketing must remain gated until integrated acceptance tests pass.

This pack must not represent Awaab support as UK-wide housing-law compliance.

---

# Schedule L — Supply chain and software licence facts

CR-07 proves existing SCA/SBOM/Dependabot/security-CI controls.

Open items:
- exact resolved/frozen dependency set for the release candidate;
- exact direct/transitive package licence register;
- owner/counsel decision about product source-code copyright/outbound licensing;
- repository currently lacks a root `LICENSE`/`LICENCE`/`COPYING`/`NOTICE` proving the product's own outbound licence;
- longer-lived release evidence outside short Actions artifact retention.

This is a procurement/legal input, not a conclusion that commercial distribution is prohibited.

---

# Schedule M — Customer DPIA support facts

A customer DPIA support sheet can truthfully provide:
- system purpose and scope;
- architecture/control-boundary diagram;
- data categories;
- provider/subprocessor facts;
- data-flow facts;
- tenant separation;
- AI/human authority boundary;
- retention/deletion design and final configured policy once approved;
- security controls;
- incident/recovery controls;
- international-transfer factual inputs;
- data-subject handling mechanics once integrated;
- known gaps/residual risks.

It must not:
- choose the customer's lawful basis;
- claim the customer is compliant;
- replace the customer's own necessity/proportionality/risk assessment;
- conceal UNKNOWN/GAP items.

The canonical source for the factual data-flow annex is `DPIA_FACT_PACK.md`.

---

# Schedule N — Evidence to provide during procurement

Subject to confidentiality/security review, the release candidate should be able to provide:
- architecture/security summary;
- current subprocessor list;
- final DPA;
- privacy notice(s);
- retention schedule;
- latest independent penetration-test executive summary;
- Cyber Essentials/other certification evidence if/when obtained;
- frozen-candidate SBOM/security scan summary;
- business-continuity/recovery summary with measured drill evidence;
- incident/support schedule;
- AI-use/transparency statement;
- DPIA support pack;
- accessibility statement for customer-facing product surfaces as applicable.

Do not provide secrets, exploit detail, raw resident data, private penetration-test working papers, or unrestricted internal logs merely because a procurement request asks for "all security information".

---

# Outstanding owner/counsel decisions

This factual pack cannot close:
1. contracting Chapelgate legal entity and statutory details;
2. final controller/processor allocations per customer use case;
3. lawful-basis and special-category-data treatment;
4. final retention periods;
5. governing law/liability/insurance/contract caps;
6. final SLA/support commitments;
7. final transfer mechanism wording;
8. product intellectual-property/licensing position;
9. final customer privacy/call-transparency wording;
10. brand/trade-mark clearance.

Those belong to CR-H02/CR-H03 and related owner decisions.

---

# CR-14 gate result

**PASS as a factual trust-pack schedule.**

This file is ready to hand to professional counsel and procurement drafting. It is deliberately **not** an MSA, DPA, SLA, privacy notice, security warranty, compliance certificate or launch approval.

The next assurance steps remain:
- complete CR-11/CR-12 and CR-13 integration;
- CR-15 penetration-test scope;
- professional CR-H03 legal approval;
- independent CR-H04 security test/retest;
- bounded design-partner pilot.
