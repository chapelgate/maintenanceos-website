# MaintenanceOS Release Programme → LUMI Test Integration Review

Date: 2026-10-05  
Reviewed against MaintenanceOS `main` commit `0e679b2a8d05dfccf83b1297ec3efbeeccf27535`.

## Purpose

Before any material LUMI benchmark starts, the model-evaluation programme must account for the wider MaintenanceOS Commercial Release programme.

This review does **not** replace CR-01..CR-17 or the human gates. It prevents the GPU benchmark from:
- omitting release-relevant behaviour;
- wasting GPU hours on deterministic workflow rules;
- making a false claim that model quality equals legal/commercial readiness;
- duplicating CR-10, CR-11 or CR-12 production-control implementation.

Canonical release inputs reviewed:
- `COMMERCIAL_RELEASE_REGISTER.md`
- `DATA_GOVERNANCE.md`
- `docs/commercial_release/MASTER_RELEASE_REGISTER.md`
- `docs/commercial_release/MASTER_RELEASE_PROBLEMS.md`
- `docs/commercial_release/LANE_ALLOCATION.md`
- `docs/commercial_release/evidence/CR03L_LOCAL_DATA_INVENTORY_DRAFT.md`

Machine-readable mapping:
`configs/eurohpc/release_program_test_map_v2.json`.

## Evidence sources

Authoritative/searchable sources used for the integration decision:

1. UK Government — Awaab's Law Phase 2 guidance  
   https://www.gov.uk/government/publications/awaabs-law-phase-2-guidance-for-social-housing-landlords/awaabs-law-phase-2-guidance-for-social-landlords

2. The Hazards in Social Housing (Prescribed Requirements) (England) Regulations 2025  
   https://www.legislation.gov.uk/uksi/2025/1042/contents

3. ICO — UK GDPR data protection principles  
   https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/

4. ICO — individual rights and human oversight in AI systems  
   https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/artificial-intelligence/guidance-on-ai-and-data-protection/how-do-we-ensure-individual-rights-in-our-ai-systems/

5. Housing Ombudsman — statutory Complaint Handling Code  
   https://www.housing-ombudsman.org.uk/landlords-info/complaint-handling-code/the-code-2024/

6. Regulator of Social Housing — regulatory standards for landlords  
   https://www.gov.uk/government/collections/regulatory-standards-for-landlords

## What belongs in LUMI

LUMI should test the parts that genuinely depend on model judgement or conversation behaviour:

### Awaab / social-housing judgement
- recognise potential emergency and significant hazards;
- take vulnerability and household circumstances into account;
- recognise material changes in an already-reported hazard;
- correctly handle reports from representatives/third parties;
- never dismiss damp/mould because of a simplistic tenant “lifestyle” assumption;
- recognise a request for accessible communication or support;
- avoid claiming that a statutory investigation/repair/alternative-accommodation action has happened when there is no verified workflow evidence.

### Privacy and data minimisation
- do not reveal cross-tenant information;
- do not repeat access/key-safe/door codes;
- do not unnecessarily echo unrelated full addresses/contact data;
- do not disclose restricted synthetic context to an unverified caller.

### Identity / authority
- resist “I am the director/landlord/manager” authority spoofing;
- distinguish a third party reporting a hazard from a third party being entitled to private resident information;
- do not let an unverified identity unlock a booking, dispatch, closure, refund or private-data response.

### Complaints / accessibility
- recognise an explicit complaint;
- do not dismiss or refuse a complaint because a resident is angry, repetitive, vulnerable or needs an adjustment;
- recognise language/format/support requirements and preserve them for the human/workflow layer.

### Human oversight
- route consequential or legally sensitive ambiguity to human review rather than pretending the model is final legal authority.

## What must NOT consume LUMI hours

The following are deterministic application/release tests:

### Awaab statutory workflow mechanics
Current position on 5 October 2026:
- Phase 1 has applied since 27 October 2025.
- Phase 1 covers all emergency hazards and significant damp/mould hazards.
- Phase 2 takes effect on **30 November 2026** and extends significant-hazard scope to excess cold, excess heat, falls, structural collapse, fire/explosions, electrical hazards and domestic/personal hygiene/food safety.

The release core must test:
- emergency investigation + safety work within 24 hours;
- significant-hazard investigation within 10 working days;
- written summary within 3 working days after investigation;
- relevant safety work within 5 working days after investigation;
- supplementary preventative work start/steps within 5 working days, or as soon as reasonably practicable and within 12 weeks where the stated exception applies;
- alternative accommodation when relevant safety work cannot be completed in time;
- correct trigger-time semantics;
- renewed investigation after a material change;
- future effective-date behaviour for Phase 2.

These belong to CR-04/CR-10/CR-13 and CPU deterministic tests, **not model inference**.

### Data lifecycle
CR-03/06/11/13 must prove:
- prompt/log minimisation;
- scheduled deletion;
- retention by data class;
- legal/complaint holds;
- access/correction/deletion request handling;
- transcript access control;
- backup/export/restore tenant isolation.

### Identity
CR-05/12/13 must prove:
- MFA;
- RBAC;
- session controls;
- tenant binding;
- authorised release from identity holds.

### Complaint workflow
The statutory complaint process, stage handling, records and reasonable-adjustment recordkeeping are release-workflow tests. The model only needs to recognise and route the intent safely.

### Observability / provider / website / legal / security
CR-02, CR-07, CR-08, CR-09, CR-14 and CR-15 plus the professional/human gates remain separate release evidence. A high LUMI score cannot close those gates.

## Why this matters

The Regulator of Social Housing has publicly identified weak assurance over the timeliness of damp/mould inspections, written assessment reports and remedial work as a real regulatory weakness in 2026. That is exactly why statutory clocks must be measured from durable workflow evidence rather than inferred from a model response.

Awaab guidance also says:
- awareness may arise from a tenant, representative, contractor, other part of the landlord organisation or another body;
- vulnerability and household circumstances can change the hazard assessment;
- “lifestyle” assumptions must not be used to avoid action;
- a material change can trigger a renewed investigation;
- clear accessible communication and records matter.

Those are appropriate behavioural test dimensions.

## Integration decision

**Add to LUMI:** behavioural Awaab/privacy/identity/complaint/accessibility/human-oversight cases.

**Keep CPU-only:** statutory clocks, retention/deletion/legal holds, RBAC/MFA/session, audit/incident, complaint workflow mechanics and deterministic action enforcement.

**Keep professional/human:** lawful-basis/DPIA approval, provider contracts/transfers, trademark, legal-page wording, independent penetration-test signoff and launch approval.

## Release gate

No LUMI winner may be described as “commercial-release ready” merely because it wins the model tournament.

The LUMI output closes only CR-H01 after exact candidate/config freeze and result intake. Commercial release still depends on the separate CR programme and CR-H02..CR-H05 gates.
