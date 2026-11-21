# Service Definition — business-evidence-wallet

## Product
business-evidence-wallet — Supplier Qualification Pack Assistant — multi-tenant evidence wallet.

## Lot
Cloud Software (SaaS)

## Description
Multi-tenant evidence wallet that lets organisations upload evidence documents (PDF, DOCX, XLSX, TXT), extract candidate facts, have humans approve them with provenance, and generate compliance/evidence packs. Organisations can prove what they claim. Used by suppliers and buyers who need to evidence qualifications, insurance, certificates, contracts.

## Key features
- Organisations, roles, invitations (capability codes, not email-identity join)
- Evidence upload (PDF, DOCX, XLSX, TXT) with safe text extraction
- Candidate fact extraction (heuristic always; optional xAI)
- Human review with provenance and fact versions
- Candidate correction before approval (original extraction kept; OCC on concurrent edits)
- Expiry, conflicts, dependency reevaluation
- Questionnaire ingest and evidence-backed response packs
- GREEN/AMBER/RED/EXPIRED/CONFLICT status (never silently upgraded)
- JSON/XLSX/DOCX export, reopened and verified
- Audit trail

## Intended users
Public sector buyers and suppliers who need to evidence qualifications, insurance, certificates, or case facts.

## Data handled
Untrusted document text sliced to 12,000 chars and wrapped via wrapUntrusted before optional xAI model call. No PII intentionally added; input may contain user document content. Output claims validated against ClaimListSchema (max 40 claims, bounded fields). Personal data may be present in uploaded documents.

## AI/ML use
Optional xAI grok-4.5 for candidate fact extraction. Output is candidate-only; human must approve. Fail-closed: if model unavailable or output fails schema validation, no claims persisted. Deterministic threshold engine gates evidence status; no model may override.

## Security & compliance
- 2095 tests incl. live HTTP IDOR (154 cases)
- Server-enforced org isolation, RLS fail-closed, IDOR tests live
- SBOM: business-evidence-wallet — 370 components, 0 critical, 0 high (PASS)
- Model card: compliance/model-cards/business-evidence-wallet.md
- DPIA draft: compliance/dpia/business-evidence-wallet.md (DRAFT — not signed off)
- Cyber Essentials self-check: PARTIAL (not certified)

## Evidence paths
- Source: /home/andy/chapelgate/repos/business-evidence-wallet/
- Model card: jobs-work-dell/readiness/compliance/model-cards/business-evidence-wallet.md
- SBOM: jobs-work-dell/readiness/sbom/business-evidence-wallet/
- DPIA: jobs-work-dell/readiness/compliance/dpia/

## Known gaps
- Cyber Essentials certification not yet obtained (fee parked)
- DPIA draft not signed off by council DPO
- No live production deployment (controlled private pilot candidate)

## Version
master head 73fe5b09b76d2f5518fe70c9124fa07bbf7db2bb (CP1 checkpoint 8 complete)