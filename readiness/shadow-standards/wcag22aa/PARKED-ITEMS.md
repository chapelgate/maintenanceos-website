# WCAG 2.2 AA — Parked Items (wcag22aa)

Source: SHADOW-TEMPLATE.md and GAPS.md in this folder.

These items cannot be fully resolved by engineering alone and require human/legal sign-off, spend, or external action. Each is recorded here per the BRIEF.md rule: "Park those silently in /home/andy/chapelgate/jobs-work-dell/readiness/PARKED.md (append only, free route around each)".

---

## Parked 1: Accessibility Statement Publication

- **Gap reference**: GAPS.md — Gap 2
- **Criterion**: Accessibility statement per GOV.UK model / PSBAR 2018 (STANDARDS.md item 22)
- **Why parked**: Legal requirement; the statement must be accurate and legally reviewed before publication. Engineering cannot self-attest compliance.
- **Free route around**: Draft statement template in code (e.g., `/docs/accessibility-statement.md`); Andy/legal reviews and publishes.
- **Owner**: Product owner / Andy (legal sign-off)
- **Tender register link**: TENDER-REGISTER.md row for PSBAR 2018 compliance

---

## Parked 2: Third-Party Accessibility Audit (CREST/ASPIRE)

- **Gap reference**: PARKED.md lines 88-93 (Andy voice 16 Nov 08:51)
- **Criterion**: Paid accessibility audit for formal certification
- **Why parked**: Requires paid third-party audit; not an engineering completion condition.
- **Free route around**: axe-core/pa11y automated scans + manual testing evidence (this shadow standard) keep us day-to-day compliant; paid audit is only for formal certification.
- **Owner**: Andy (spend decision)
- **Tender register link**: TENDER-REGISTER.md row for public-sector accessibility audit

---

## Parked 3: Welsh Language Compliance Audit

- **Gap reference**: STANDARDS.md item 28, GAPS.md line 63 (from release-standards-council)
- **Criterion**: Welsh language support parity where public-sector facing
- **Why parked**: Requires Welsh Language Commissioner or qualified auditor; cannot self-attest.
- **Free route around**: Engineering implements Welsh toggle and content parity; audit parked for Andy/specialist.
- **Owner**: Andy / specialist
- **Tender register link**: TENDER-REGISTER.md row for Welsh Language Standards

---

## Parked 4: Equality Impact Assessment (EqIA)

- **Gap reference**: STANDARDS.md item 29, release-standards-council GAPS.md line 64
- **Criterion**: Equality Act 2010 — no discrimination; reasonable adjustments documented
- **Why parked**: Public sector equality duty requires documented EqIA; policy/legal sign-off.
- **Free route around**: Engineering ensures product accessibility features support reasonable adjustments; EqIA drafted for legal review.
- **Owner**: Policy / legal
- **Tender register link**: TENDER-REGISTER.md row for Equality Act 2010

---

## Parked 5: Consumer Rights Act 2015 Terms Review

- **Gap reference**: STANDARDS.md item 46, release-standards-council GAPS.md line 61
- **Criterion**: Clear terms, fair contract terms, 14-day cooling-off
- **Why parked**: Legal review required for consumer-facing terms.
- **Free route around**: Draft terms prepared; legal reviews and approves.
- **Owner**: Legal
- **Tender register link**: TENDER-REGISTER.md row for Consumer Rights Act 2015

---

## Summary

| Parked Item | Requires | Blocking Product Release? |
|-------------|----------|---------------------------|
| Accessibility statement publication | Legal sign-off | No (shadow standard met without formal cert) |
| Third-party accessibility audit | Spend / contract | No (shadow standard met without formal cert) |
| Welsh language compliance audit | Specialist / auditor | No (shadow standard met without formal cert) |
| Equality Impact Assessment | Policy / legal | No (shadow standard met without formal cert) |
| Consumer Rights Act terms review | Legal | No (shadow standard met without formal cert) |

**Note**: Per BRIEF.md hard rule: "HB-001..010 (insurance, professional indemnity, Cyber Essentials, legal/ICO, accounts, independent human review and similar Andy-only launch work) NEVER stop, gate or end the engineering loop. They are Andy's last-minute responsibility, not engineering completion conditions."

Product-ready for WCAG 2.2 AA shadow standard = all 50 A+AA criteria MET/PARTIAL with evidence on disk, operating rhythm wired, gaps documented. Formal certification and legal sign-offs are separate from product-readiness.