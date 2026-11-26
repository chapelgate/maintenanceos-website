# QMS Evidence — maintenanceos-website

## Problem
Shadow ISO 9001 deliverables are marked GAP across all 12 estate products because no QMS evidence exists in any repo. Council review confirmed FAIL status pending real repo path/commit evidence per clause 4–10.

## Solution
Add 13 QMS documents under docs/quality/ covering ISO 9001:2015 clauses 4–10 for maintenanceos-website. Each document cites real evidence paths in this repo (CI workflows, tests, CHANGELOG, PR history, FAILURE-LOG).

## Scope
- docs/quality/01-quality-policy-objectives.md (5.2, 6.2)
- docs/quality/02-roles-responsibilities.md (5.3)
- docs/quality/03-risk-opportunity-register.md (6.1)
- docs/quality/04-document-control.md (7.5)
- docs/quality/05-design-development.md (8.3)
- docs/quality/06-supplier-control.md (8.4)
- docs/quality/07-nonconformity-corrective-action.md (10.2)
- docs/quality/08-internal-audit.md (9.2)
- docs/quality/09-management-review-template.md (9.3)
- docs/quality/10-capa-log-template.md (10.2)
- docs/quality/11-audit-report-template.md (9.2)
- docs/quality/12-training-record-template.md (7.2)
- docs/quality/13-release-record-template.md (8.5.1, 8.6)

## Non-goals
- Certification audit (PARKED per Andy/HB items)
- Spend, sudo, production deployment
- Changes to non-QMS files
