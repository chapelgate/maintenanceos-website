# OWASP ASVS 5.0 Level 2 — Parked Items (owasp-asvs-l2)

Source: SHADOW-TEMPLATE.md and GAPS.md in this folder.

These items cannot be fully resolved by engineering alone and require human/legal sign-off, spend, or external action. Each is recorded here per the BRIEF.md rule: "Park those silently in /home/andy/chapelgate/jobs-work-dell/readiness/PARKED.md (append only, free route around each)".

---

## Parked 1: Semgrep remediation SLA for finding closure
- **Gap reference**: GAPS.md — Gaps G01, G10, G31
- **Criterion**: Documented SLA for fixing SAST findings from semgrep CI scans; no fix-backlog SLA defined.
- **Why parked**: Engineering cannot self-attest remediation SLA; Andy/leadership must define acceptable turnaround time for security findings.
- **Free route around**: Semgrep CI workflow added (free fix); SLA definition requires Andy decision. GAPS.md lists remediation SLA as Open until Andy defines SLA.
- **Owner**: Andy / Engineering leadership (Andy-only per HB-001..010)
- **Tender register link**: TENDER-REGISTER.md row for ASVS L2 remediation SLA

---

## Parked 2: Third-party penetration test for ASVS L2 certification
- **Gap reference**: GAPS.md — Gaps G02, G32, G34 (gitleaks, build signing, DAST)
- **Criterion**: Formal third-party penetration test for ASVS L2 certification; not an engineering completion condition.
- **Why parked**: Requires paid third-party pentest; shadow standard compliance achievable without formal cert via free scanners. Paid audit only for formal certification.
- **Free route around**: Semgrep/gitleaks/ZAP automated scans + manual test evidence (shadow standard) keep us day-to-day compliant; paid audit is only for formal ASVS L2 certification.
- **Owner**: Andy (spend decision)
- **Tender register link**: TENDER-REGISTER.md row for third-party penetration test

---

## Parked 3: ISO 27001 / SOC 2 certification alignment
- **Gap reference**: GAPS.md — Gaps G32 (build signing), G33 (threat model review)
- **Criterion**: Formal ISO 27001 or SOC 2 certification alignment for ASVS L2 claimed compliance.
- **Why parked**: Certification audit requires UKAS-accredited body and spend; shadow standard compliance achievable via free scanners and documented controls.
- **Free route around**: Shadow ASVS L2 template, GAPS.md, OPERATING-RHYTHM.md keep us day-to-day compliant; certification audit parked for Andy/specialist.
- **Owner**: Andy / Specialist
- **Tender register link**: TENDER-REGISTER.md row for ISO 27001 / SOC 2 certification

---

## Parked 4: G-Cloud / Digital Marketplace listing for ASVS L2
- **Gap reference**: GAPS.md — Gaps related to public-sector buyer requirements
- **Criterion**: G-Cloud / Digital Marketplace listing requirements for public-sector contracts using ASVS L2 compliance claim.
- **Why parked**: Requires formal application, pricing, terms, and security questionnaire complete per Digital Marketplace rules; engineering cannot self-attest listing compliance.
- **Free route around**: Engineering implements ASVS L2 controls; Andy/legal completes G-Cloud listing process. GAPS.md tracks free fixes; listing requires Andy sign-off.
- **Owner**: Andy / Legal
- **Tender register link**: TENDER-REGISTER.md row for G-Cloud / Digital Marketplace

---

## Parked 5: Cyber Essentials Plus certification for ASVS L2 products
- **Gap reference**: GAPS.md — Gaps related to Cyber Essentials requirement
- **Criterion**: Cyber Essentials Plus certification for products claiming ASVS L2 compliance in public-sector contracts.
- **Why parked**: Certification requires paid assessment body; HB-005 (Cyber Essentials) is Andy-only responsibility per BRIEF.md hard rule.
- **Free route around**: Engineering implements ASVS L2 controls; Cyber Essentials Plus requires paid assessment and Andy-only sign-off. GAPS.md tracks free fixes only.
- **Owner**: Andy (HB-005 per BRIEF.md hard rule)
- **Tender register link**: TENDER-REGISTER.md row for Cyber Essentials Plus

---

## Summary

| Parked Item | Requires | Blocking Product Release? |
|-------------|----------|---------------------------|
| Semgrep remediation SLA | Andy/leadership decision | No (shadow standard met without formal SLA) |
| Third-party pen test | Spend / contract | No (shadow standard met without formal cert) |
| ISO 27001 / SOC 2 alignment | Specialist / auditor | No (shadow standard met without formal cert) |
| G-Cloud listing | Legal / Andy sign-off | No (shadow standard met without formal cert) |
| Cyber Essentials Plus | Andy (HB-005) | No (shadow standard met without formal cert) |

**Note**: Per BRIEF.md hard rule: "HB-001..010 (insurance, professional indemnity, Cyber Essentials, legal/ICO, accounts, independent human review and similar Andy-only launch work) NEVER stop, gate or end the engineering loop. They are Andy's last-minute responsibility, not engineering completion conditions."

Product-ready for OWASP ASVS L2 shadow standard = all 30 L2 controls MET/PARTIAL with evidence on disk, operating rhythm wired, gaps documented. Formal certification and legal sign-offs are separate from product-readiness.