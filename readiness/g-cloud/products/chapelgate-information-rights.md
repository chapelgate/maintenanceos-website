# Service Definition — chapelgate-information-rights

## Product
chapelgate-information-rights — Chapelgate Information Rights Operating System — Statutory case management for UK public authorities under FOIA 2000, EIR 2004, and UK GDPR Subject Access Requests (SARs).

## Lot
Cloud Software (SaaS)

## Description
Statutory case management for UK public authorities handling Freedom of Information Act 2000, Environmental Information Regulations 2004, and UK GDPR Subject Access Requests. The officer case file is ir_web. Legal matters for the same organisation are the Matters screens. Deterministic statutory clock engine using Python 3.11 standard library only (no LLM date arithmetic).

## Key features
- Deterministic statutory clocks (zero LLM arithmetic):
  - FOIA 2000 & EIR 2004: 20 statutory working days excluding weekends, Good Friday, Christmas Day, jurisdictional bank holidays
  - FOISA 2002 (Scotland): 20 working days excluding Scottish bank holidays only (feature flag default off — outside current offer)
  - UK GDPR SAR (DPA 2018): 1 calendar month (standard) or 3 calendar months (complex) using corresponding date rule with month-end clamping and rollover to next working day
- Extensions:
  - FOIA: up to 40 working days (20 further days) with SIRO identifier, different officer, written reason (20+ chars) — UNVERIFIED statutory ceiling
  - EIR: up to 40 working days (reg 7(1)) — VERIFIED from legislation.gov.uk 18 Oct 2026; code refuses longer
  - FOISA extensions rejected by code (disabled by default)
- Clarification resets/pauses:
  - FOIA s.1(3) / EIR reg 9(4): clock resets to Day 0 on clarification receipt
  - UK GDPR SAR: clock pauses during genuine clarification, shifting candidate deadline by calendar days paused
  - FOIA s.10(2): fee notice pauses clock until payment received
- Vendored bank holidays snapshot (data/bank-holidays.json from gov.uk/bank-holidays.json); zero network calls at runtime
- Redaction engine: rule-based, TNA Redaction Toolkit principles (master copy preservation, irreversible bitstream destruction, four-eyes verification)

## Intended users
UK public authorities (councils, NHS trusts, government departments) in England and Wales for FOI, EIR, and SAR.

## Data handled
Case documents, correspondence text, exemption codes, officer IDs. Personal data present in case files. Redaction is deterministic and rule-based.

## AI/ML use
None. Redaction engine is rule-based implementing TNA Redaction Toolkit principles. No AI/ML model invoked.

## Security & compliance
- SBOM: chapelgate-information-rights — 12 components, 0 critical, 10 high, 5 medium (REVIEW)
- Model card: compliance/model-cards/chapelgate-information-rights.md
- Cyber Essentials self-check: PARTIAL (not certified)
- WCAG 2.2 AA accessibility target (see docs/readiness/README.md)

## Evidence paths
- Source: /home/andy/chapelgate/repos/chapelgate-information-rights/
- Model card: jobs-work-dell/readiness/compliance/model-cards/chapelgate-information-rights.md
- SBOM: jobs-work-dell/readiness/sbom/chapelgate-information-rights/

## Known gaps
- Cyber Essentials certification not yet obtained
- FOISA (Scotland) disabled by default — outside current offer
- FOIA extension >40 days UNVERIFIED statutory ceiling
- No live production deployment

## Version
slice2-recheck snapshot (commit 8794b4687fb8be989692a9b3fd2aed05c65efd99)