# CR-04 — Awaab Statutory Requirements Matrix

**Status:** EVIDENCE COMPLETE — implementation remains CR-10/CR-13
**Date:** 2026-10-05
**Scope:** England social rented sector. Engineering requirements only; not legal advice.

## Authoritative sources

- GOV.UK Awaab's Law collection: https://www.gov.uk/government/collections/awaabs-law-in-the-social-rented-sector
- Phase 1 guidance: https://www.gov.uk/government/publications/awaabs-law-guidance-for-social-landlords/awaabs-law-guidance-for-social-landlords-timeframes-for-repairs-in-the-social-rented-sector
- Phase 2 guidance: https://www.gov.uk/government/publications/awaabs-law-phase-2-guidance-for-social-housing-landlords/awaabs-law-phase-2-guidance-for-social-landlords
- Phase 2 triage guidance: https://www.gov.uk/government/publications/awaabs-law-phase-2-hazards-guidance-for-social-landlords/awaabs-law-phase-2-guidance-to-support-triaging-of-hazards
- 2025 Regulations: https://www.legislation.gov.uk/uksi/2025/1042/body
- Regulation 9 (written summary): https://www.legislation.gov.uk/uksi/2025/1042/regulation/9
- Regulation 11 (make safe — significant hazard): https://www.legislation.gov.uk/uksi/2025/1042/regulation/11
- Regulation 13 (supplementary preventative work): https://www.legislation.gov.uk/uksi/2025/1042/regulation/13

## Phase/date gate

| Effective period | Significant hazards in Awaab scope | Emergency hazards |
|---|---|---|
| 27 Oct 2025 to 29 Nov 2026 | Damp and mould hazards presenting significant risk | Emergency hazards within the regulations |
| From 30 Nov 2026 | Damp/mould plus excess cold, excess heat, falls, structural collapse, fire/explosions, electrical hazards, and domestic/personal hygiene and food safety where significant | Emergency hazards, with overcrowding excluded from the relevant-hazard definition |

The policy core must use incident/report date plus jurisdiction/tenure. Phase 2 logic must not be retroactively applied to a Phase 1 incident merely because the software was upgraded later.

## Timing/control matrix

| Trigger / outcome | Maximum period / rule | Evidence MaintenanceOS must retain |
|---|---|---|
| Landlord becomes aware of a potential significant hazard | Standard investigation within **10 working days** | awareness timestamp; due-at; investigation start/completion; investigator; evidence |
| Standard investigation clock | GOV.UK guidance states **day 1 is the day after** the landlord becomes aware | deterministic working-day calculation and original awareness timestamp |
| Reasonable grounds to believe an emergency hazard exists | Emergency investigation as soon as reasonably practicable and within **24 hours** | belief/awareness timestamp; reason; investigation timing; evidence |
| Emergency investigation identifies relevant safety work | Make safe as soon as reasonably practicable and within **24 hours** | safety-work due/completed timestamps and evidence |
| Investigation identifies significant hazard and relevant safety work | Complete relevant safety work within **5 working days**, beginning after investigation completion | investigation-complete timestamp; due/completed timestamps; evidence |
| Written summary required | Within **3 working days** beginning the day after investigation completion | summary due/sent; delivery method; content/evidence |
| All required work completed before the 3-working-day written-summary period ends | Regulation 9 exemption may apply | repair completion evidence retained even where no summary is required |
| Relevant supplementary preventative work identified | Begin within **5 working days** | start/step due-at; actual start; evidence |
| Supplementary work cannot reasonably begin within 5 working days | Take steps within that period so work begins ASAP and within **12 weeks** | reason; steps taken; contractor/material/approval evidence; backstop date |
| Home cannot be made safe within initial remediation period and temporary rehousing rules apply | Secure suitable alternative accommodation until the relevant statutory ending condition | offer/suitability/acceptance/refusal; start/end; progress updates |
| Remote investigation followed by qualifying request for in-person investigation | Renewed investigation; potential significant hazard normally within **10 working days of request** | request timestamp; previous method; renewed due/completed; outcome |
| Material change after prior investigation | New standard investigation/timeframes can be triggered | material-change timestamp, evidence and new clock, preserving prior history |
| Further investigation needed | Complete as soon as reasonably practicable; already identified safety work remains due on original safety clock | further-investigation reason and status; original safety deadline preserved |

## Investigation types

The Phase 2 guidance identifies four key types:
1. standard;
2. renewed;
3. emergency;
4. further investigation.

The data/evidence model must distinguish them instead of storing one generic "inspection".

## Triage / professional-authority boundary

Current GOV.UK guidance says the assessment is person-centred and considers the actual resident's circumstances. It also states that landlords must exercise professional judgement; prompt questions are guidance rather than an exhaustive checklist.

MaintenanceOS rule:
- AI may collect facts, ask prompts, flag candidate hazards and calculate clocks.
- AI must not be the final authority that declares a household safe, suppresses a statutory clock, or clears a significant/emergency hazard.
- Authorised human judgement and the reason/evidence must be retained.
- Unknown resident circumstances or ambiguous evidence remain UNKNOWN / needs review; they do not auto-pass.

## Resident-circumstance facts that the workflow must be able to surface

GOV.UK guidance includes prompts about:
- children, older adults and people with health conditions;
- mobility/adaptation needs;
- health/social-care support;
- symptoms potentially caused or worsened by the hazard;
- loss of essential rooms;
- communication/support format or language needs;
- other household circumstances relevant to risk.

Collection/retention/access for these facts belongs to CR-03/data governance and legal review, not this matrix.

## Minimum deterministic acceptance scenarios for CR-10

1. **Phase 1 significant damp/mould** — report before 30 Nov 2026; 10-working-day investigation; significant finding produces 5-working-day safety clock and 3-working-day written-summary clock.
2. **Phase 1 other significant category** — non-emergency electrical/fall/etc before Phase 2 must not be put into Phase-2 significant-hazard logic solely by this module.
3. **Emergency at first report** — reasonable grounds create the 24-hour emergency clock.
4. **Emergency discovered during standard/renewed investigation** — emergency action starts without waiting for the standard clock to expire.
5. **Day-1 calculation** — for standard investigation, day 1 is the day after awareness.
6. **Make-safe before summary deadline** — test Regulation 9 summary exemption while preserving repair/audit evidence.
7. **Cannot make safe inside initial period** — temporary-accommodation path is raised rather than silently leaving the resident unsafe.
8. **Supplementary work unavailable within five working days** — steps must be evidenced inside five working days and the 12-week backstop calculated.
9. **Resident circumstances change urgency** — the same physical defect can be escalated by authorised judgement based on the household; the model cannot downgrade it.
10. **Remote then renewed in-person request** — open renewed-investigation clock without erasing existing safety obligations.
11. **Material change** — worsening hazard or relevant resident circumstance produces a new investigation clock while original history remains immutable.
12. **Further investigation pending** — any safety work already identified remains due on the original five-working-day/24-hour clock.
13. **Alternative accommodation declined** — record offer, suitability, refusal and safety communication; do not mark the hazard resolved.
14. **Phase switch** — qualifying Phase 2 significant hazard on/after 30 Nov 2026 uses Phase 2 logic; an earlier incident does not get retroactively reclassified.
15. **Working-day calculation** — weekends/non-working days are handled deterministically and calendar rules are tested.
16. **State mutation attack** — work-order close/reopen, contractor completion, resident confirmation, AI output or category edit cannot erase original awareness, investigation or statutory deadlines.
17. **Professional override** — authorised human can classify/escalate with substantive reason; AI cannot clear the decision/evidence.

## Product implications

- Generic P1/P2/P3/P4 SLAs are not themselves proof of Awaab compliance.
- Statutory clocks need explicit evidence fields/events rather than being inferred later from generic priority.
- Social-housing marketing remains gated until CR-10 implementation, CR-13 integration and acceptance evidence pass.
- This matrix applies to England social housing and must not be presented as a UK-wide housing-law module.

## Gate

**CR-04 PASS as a requirements/research slice.**
CR-10 remains held until CR-03 also completes.
