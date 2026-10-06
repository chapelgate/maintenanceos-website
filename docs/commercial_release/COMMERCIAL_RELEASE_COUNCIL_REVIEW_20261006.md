# MaintenanceOS — Commercial Release Council Review

Date: 2026-10-06
Status: PRE-LAUNCH / LATE-STAGE RELEASE HARDENING
Scope: commercial release readiness, UK legal/privacy/security readiness, and jurisdiction-expansion gating.
Evidence rule: no item is treated as complete without repository/runtime evidence or an authoritative external source. This is an engineering/legal-readiness review, not professional legal advice or legal sign-off.

## Council lenses used

This review applies six independent lenses to the same release candidate:
1. product/release engineering;
2. security/IAM and recovery;
3. UK privacy/data protection;
4. housing/Awaab operational compliance;
5. AI/telecoms/customer transparency;
6. commercial contracts/IP/international expansion.

The existing MaintenanceOS commercial-release register remains authoritative. This review does not create a second execution system.

## Current release position

MaintenanceOS is technically beyond prototype but is not ready for general commercial availability.

Evidence on current main:
- canonical post-call email repair is merged and regression-covered;
- CR-13A lifecycle runtime and CR-13C Awaab runtime are present on main;
- the managed-identity decision selects Auth0 Essentials, but real Auth0 tenant/application/API configuration is not yet available;
- LUMI Wave 1 is running but no final LUMI winner/candidate freeze is yet evidenced;
- provider-rights research, website legal-source inventory, DPIA fact pack, security baseline, trust-pack preparation and recovery plan exist;
- production-like managed PostgreSQL backup/PITR/restore evidence has not yet been executed;
- central/tamper-resistant observability and alert delivery evidence remain incomplete;
- independent penetration testing/retest, professional legal approval, UK design-partner pilot, final release audit and launch approval remain open;
- existing-host deployment authority for the accepted MaintenanceOS runtime remains unavailable through the approved path.

Conclusion: the project is in release hardening, not GA. The next work should reduce release risk; no new product features are justified until the critical gates below are closed.

## Critical path — execute in this order where dependencies allow

| Priority | Job | Acceptance evidence |
|---|---|---|
| P0-01 | Freeze the exact LUMI-selected candidate/model/configuration after the current evaluation finishes. | Exact Git SHA, model/provider/config manifest, benchmark evidence, rollback point. |
| P0-02 | Restore the approved existing MaintenanceOS deployment identity/path. Do not create an ad-hoc SSH bypass or rebuild the live host. | Approved USH/cg-automation route can deploy/restart/read health on the accepted target without exposing secrets. |
| P0-03 | Configure the real managed IdP (selected: Auth0) and enforce tenant, role, MFA/assurance, expiry and revocation correlation fail-closed. | Real-tenant integration test; invalid tenant/role/MFA/expired/revoked tokens rejected; admin/customer session tests retained. |
| P0-04 | Finish production data lifecycle controls. | Approved retention schedule by data class; legal hold; DSAR export; correction; erasure/anonymisation; transcript handling; tenant isolation; backup deletion/replay; live tests. |
| P0-05 | Complete DPIA and controller/processor/lawful-basis decisions for the frozen product. | Signed DPIA; lawful basis per purpose; LIA where used; special-category/emergency treatment; controller/processor map; residual risks approved. |
| P0-06 | Finalise provider DPAs, transfer mechanisms and configuration proof for every active provider. | Current terms/DPA, subprocessor list, processing region, retention, training/data-use setting, UK transfer mechanism/data-protection test where required, deletion/exit route. |
| P0-07 | Finalise the caller AI/privacy notice. | First-interaction disclosure that caller is speaking to AI; accurate statement of transcript/audio recording; purpose, providers, retention, rights and human-help route; tested against frozen runtime. |
| P0-08 | Execute production-like database recovery and rollback drills. | Managed PostgreSQL backup restore, PITR, migration rollback, runtime/config rollback, measured results, independent review. |
| P0-09 | Finish production observability and incident response. | Central redacted logs, alert delivery/acknowledgement, correlation IDs, tamper-resistant evidence retention, provider outage and breach tabletop tests. |
| P0-10 | Close social-housing/Awaab acceptance for the intended market. | Current Phase 1 timing tests plus Phase 2 hazard rules effective 30 Nov 2026; written-summary, safety-work, escalation and evidence timing verified end to end. |
| P0-11 | Finalise UK website/customer legal pack and statutory company disclosures. | Verified contracting entity; registered details; privacy notice; cookie/storage notice; B2B terms; DPA; subprocessor schedule; SLA/support terms; AI/call disclosure; counsel approval. |
| P0-12 | Complete independent penetration test and retest on the integrated release candidate. | Signed scope, report, remediation evidence, retest closure; no unresolved Critical/High release blocker. |
| P0-13 | Run the bounded UK design-partner pilot. | Exact-candidate entry criteria, live operational evidence, incident metrics, support/recovery proof, exit criteria passed. |
| P0-14 | Run CR-17 final independent evidence audit and owner launch approval. | All mandatory rows PASS/NA with evidence tied to exact candidate; no hidden Critical/High blockers. |

## UK legal and regulatory closure

### Data protection and privacy

The frozen product must be assessed under the UK GDPR and Data Protection Act 2018 as amended by the Data (Use and Access) Act 2025.

Required closure:
- determine controller/processor/joint-controller roles per processing activity;
- pay/register for the ICO data-protection fee if the contracting controller is not exempt;
- maintain an Article 30-style processing record / data inventory appropriate to the organisation;
- define a lawful basis for every processing purpose before processing;
- complete the DPIA because AI voice/transcript processing and vulnerable/social-housing contexts can create elevated risks;
- issue clear privacy information covering purposes, recipients, retention, transfers, rights and complaint route;
- contract with processors under Article 28 requirements;
- implement DSAR/access, rectification, erasure, restriction and objection handling;
- implement breach detection/assessment/logging and the 72-hour ICO reporting route where notification is required;
- apply data protection by design/default and least-data principles.

Authoritative sources:
- ICO DPIA: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/guide-to-accountability-and-governance/data-protection-impact-assessments/
- ICO controller/processor guidance: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/controllers-and-processors/controllers-and-processors-a-guide/
- ICO processor contracts: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/contracts-and-liabilities-between-controllers-and-processors-multi/
- ICO international transfers: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/a-guide-to-international-transfers/
- ICO breach guide: https://ico.org.uk/for-organisations/report-a-breach/personal-data-breach/personal-data-breaches-a-guide/
- ICO lawful bases: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/
- GOV.UK data-protection fee: https://www.gov.uk/data-protection-register-notify-ico-personal-data

### Call recording/transcription and AI disclosure

The release must not use generic wording such as “calls are recorded” unless the frozen runtime actually stores audio.

For UK processing:
- callers must receive transparent information about monitoring/transcription and its purpose;
- the lawful basis must be documented rather than assuming consent is always required;
- staff/customer monitoring must be necessary and proportionate;
- retention must be limited and access controlled.

Authoritative source:
- ICO monitoring/call guidance: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/employment/monitoring-workers/specific-data-protection-considerations-for-different-ways-or-methods-of-monitoring-workers/

For EU/EEA expansion, Article 50 AI Act transparency obligations apply from 2 August 2026. People directly interacting with an AI system must be informed from the start of the first interaction unless the AI nature is obvious. MaintenanceOS should therefore keep explicit AI disclosure as the default rather than relying on the exception.
- EU Commission Article 50 guidance: https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act
- EU AI Act: https://eur-lex.europa.eu/eli/reg/2024/1689

### Website, online contracting and cookies/storage

Before GA:
- verify the actual contracting company and display required company identity, geographic/registered address and registration details;
- provide an electronic contact route;
- make terms storable/reproducible;
- if online contracting is enabled, provide the required ordering/error-correction information unless a B2B exception is contractually used;
- keep non-essential storage/cookies off until valid consent exists; if only strictly necessary storage is used, accurately disclose it rather than adding a cosmetic banner.

Authoritative sources:
- Electronic Commerce Regulations 2002, current 2026 text: https://www.legislation.gov.uk/uksi/2002/2013/body/2026-05-07
- GOV.UK company disclosure guidance: https://www.gov.uk/government/publications/incorporation-and-names/incorporation-and-names
- ICO storage/access technologies: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/

### Housing/Awaab

For England social-housing customers:
- Phase 1 has applied since 27 October 2025 to emergency hazards and significant damp/mould;
- emergency investigations and required safety work are subject to a 24-hour period;
- significant hazards have investigation, written-summary, safety-work and preventative-work deadlines;
- Phase 2 takes effect on 30 November 2026 and extends significant-hazard coverage to additional hazards including excess cold/heat, falls, structural collapse, fire/explosion, electrical and domestic hygiene hazards.

The product must encode these deadlines deterministically and must not permit a language model to override them.
Authoritative sources:
- GOV.UK Awaab guidance: https://www.gov.uk/government/publications/awaabs-law-guidance-for-social-landlords/awaabs-law-guidance-for-social-landlords-timeframes-for-repairs-in-the-social-rented-sector
- GOV.UK Phase 2 collection: https://www.gov.uk/government/collections/awaabs-law-in-the-social-rented-sector
- Regulations: https://www.legislation.gov.uk/uksi/2025/1042

### Accessibility and equality

Public-facing resident/caller/customer services must account for the Equality Act duty not to discriminate and to make reasonable adjustments. For public-sector customers, WCAG 2.2 AA and an accessibility statement may be contractually/statutorily relevant to their deployed service.
Authoritative sources:
- Equality Act 2010 section 29: https://www.legislation.gov.uk/ukpga/2010/15
- 2026 EHRC services code: https://www.gov.uk/government/publications/equality-act-2010-code-of-practice-for-services-public-functions-and-associations-2026
- GOV.UK public-sector accessibility requirements: https://www.gov.uk/guidance/accessibility-requirements-for-public-sector-websites-and-apps

## Security, authentication and assurance

Current code already has meaningful baseline controls: bounded ingress, security headers, Twilio signature checking, tenant isolation tests, non-root container checks, dependency audit/SBOM workflow and secret-pattern guards.

Release-critical remaining security work:
- real managed IdP with MFA/RBAC/tenant/session/revocation;
- production central logging/alerting/tamper-resistant audit;
- managed-database recovery proof;
- exact candidate dependency freeze and long-lived evidence;
- container/base-image vulnerability evidence and immutable image identity;
- root product licence/copyright decision and third-party licence register;
- independent penetration testing.

Password policy should not become a bespoke local-auth subsystem. The existing “no local password login” decision is preferable. Where passwords exist in the managed IdP, use provider/NCSC-aligned controls with MFA, anti-guessing/throttling, no artificial maximum length and no arbitrary complexity rules.
Authoritative sources:
- NCSC Cyber Essentials v3.3: https://www.ncsc.gov.uk/sites/default/files/documents/cyber-essentials-requirements-for-it-infrastructure-v3-3.pdf
- NCSC password guidance: https://www.ncsc.gov.uk/collection/passwords/updating-your-approach

## SOC 2 / Cyber Essentials / ISO position

If “soccer” meant SOC 2:
- SOC 2 is an assurance examination against AICPA Trust Services Criteria, not a UK statutory permission to launch.
- Do not block the first UK design-partner pilot on SOC 2 unless a customer contract requires it.
- Cyber Essentials is the better near-term UK procurement/security hygiene milestone after the P0 controls are real and evidenced.
- ISO 27001/SOC 2 can follow when customer demand and operating history justify the cost; they do not replace UK GDPR, Awaab, contract, accessibility or telecom/privacy obligations.

Authoritative sources:
- AICPA SOC overview: https://www.aicpa-cima.com/resources/landing/system-and-organization-controls-soc-suite-of-services
- NCSC Cyber Essentials resources: https://www.ncsc.gov.uk/cyberessentials/resources

## International release policy

Do not label MaintenanceOS “globally compliant”.

Adopt a default-deny market whitelist:
- UK: first commercial/design-partner market after all UK P0 gates pass.
- EU/EEA: separate gate requiring EU GDPR role/transfer review and AI Act Article 50 disclosure; assess whether any intended housing/public-service use crosses Annex III high-risk boundaries before sale.
- Every other country: no contracting/onboarding until a jurisdiction pack identifies privacy, AI/automated-decision, telecom/call-recording, cybersecurity, consumer/B2B contracting, accessibility, data-localisation and breach-notification rules.

The website may remain globally readable, but commercial contracting/onboarding and production processing must be restricted to approved markets until each jurisdiction pack passes.

## High-priority edge smoothing after P0

| Priority | Job | Acceptance |
|---|---|---|
| P1-01 | Freeze dependency resolution and exact package evidence for the release candidate; decide lock/hash strategy. | Reproducible package set, SBOM, pip-audit and retained evidence tied to SHA/image. |
| P1-02 | Complete open-source/commercial licence register and product copyright/outbound-licence decision. | Counsel/owner-approved licence register and notices. |
| P1-03 | Adopt written vulnerability remediation/exception SLAs. | Severity targets, deferral owner, expiry, reachability evidence, exception register. |
| P1-04 | Accessibility test voice + web + customer dashboard with disabled-user scenarios. | WCAG 2.2 AA evidence where applicable plus reasonable-adjustment routes for phone users. |
| P1-05 | Finalise incident/breach runbook and conduct tabletop. | 72-hour timer workflow, decision log, customer notification template, tested contacts. |
| P1-06 | Finalise customer trust pack. | DPA, subprocessor schedule, security summary, recovery/incident commitments, data-flow and retention schedules matching reality. |
| P1-07 | Commercial contract pack. | MSA/order form, SLA/support, acceptable use, liability/indemnity/IP, suspension/termination, data return/deletion, change control, governing law; professional approval. |
| P1-08 | Cyber Essentials readiness and certification. | Current v3.3 assessment passes on in-scope environment. |
| P2-01 | SOC 2 readiness mapping only after design-partner operation produces real evidence. | Trust Services Criteria gap map; engage CPA only when commercially justified. |
| P2-02 | ISO 27001 decision. | Cost/customer-demand decision; no duplicate controls programme. |
| P2-03 | Expand jurisdiction whitelist one market at a time. | Signed legal/regulatory pack and configuration tests for each new country/region. |

## Final recommendation

The shortest safe route to revenue is not “finish every possible certification”. It is:

UK-only design-partner release -> close P0 identity/data/privacy/recovery/observability/legal/security gates -> independent pen test -> UK pilot -> final evidence audit -> controlled commercial launch.

EU/EEA and other markets should remain contractually disabled until their jurisdiction pack passes. This avoids converting an almost-release-ready UK product into an indefinite global-compliance programme.
