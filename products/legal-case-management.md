# Service Definition — legal-case-management

## Product
legal-case-management (LCM) — Separately Named Edition — Legal case management pilot built on the proven Information Rights core.

## Lot
Cloud Software (SaaS)

## Description
Legal case management pilot: case, chronology, redaction, PII handling, bundle UI. Deterministic Python application. Configuration edition over the frozen Information Rights `lc*` module (case-management workflow, document bundling, court bundle generation, non-statutory deadline tracking, time recording, conflict checks, synthetic demo).

## Key features
- Case management workflow
- Chronology
- Redaction engine (rule-based)
- PII handling
- Court bundle generation
- Non-statutory deadline tracking
- Time recording
- Conflict checks
- Synthetic demo data

## Intended users
Legal teams within public authorities (councils, etc.) managing cases.

## Data handled
Case records, chronologies, redacted documents, PII. Personal data central to this product.

## AI/ML use
None. Deterministic Python application. No AI/ML model dependency in product runtime.

## Security & compliance
- SBOM: legal-case-management — 9 components, 0 critical, 10 high, 5 medium (REVIEW)
- Model card: compliance/model-cards/legal-case-management.md
- Cyber Essentials self-check: PARTIAL (not certified)
- Pilot tests previously 178 passed; smoke tests fail on missing docs/PILOT_BRIEF.md (pre-existing infrastructure, logged in FAILURE-LOG)

## Evidence paths
- Source: /home/andy/chapelgate/repos/legal-case-management/
- Model card: jobs-work-dell/readiness/compliance/model-cards/legal-case-management.md
- SBOM: jobs-work-dell/readiness/sbom/legal-case-management/

## Known gaps
- Pilot runtime (single tenant) — not multi-tenant SaaS as-is
- Smoke tests fail on missing docs/PILOT_BRIEF.md (infrastructure issue)
- Cyber Essentials certification not yet obtained
- No live production deployment

## Version
slice2-recheck snapshot (commit 9f58a310a17ae5c6e5a5ed17f08d8b44d60dfdbe)