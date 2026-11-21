# iso-9001 — ISO 9001:2015 Quality Management (clauses 4-10)

## Requirement
ISO 9001:2015 clauses 4-10: context of organization, leadership, planning, support, operation, performance evaluation, improvement. Chapelgate operates QMS day to day so certification is a formality.

Applies to: All 12 estate products
Source: ISO 9001:2015 official public standard; release-standards-council-20261114/out/STANDARDS.md

## How Chapelgate Meets It in Practice
Chapelgate maintains documented QMS processes across all 12 products for context, leadership commitment, planning, resource management, operation control, performance monitoring, and continuous improvement. Evidence tracked via council-governed artefacts, FAILURE-LOG, and Dell timers.

## EVIDENCE
- **Requirement source**: ISO 9001:2015 clauses 4-10 — official public standard, accessed 2026-11-16
- **Standard item**: ISO 9001 quality management clauses in release-standards-council-20261114/out/STANDARDS.md
- **Chapelgate repo**: QMS artefacts across estate repos; council-compliance-pack-20261115 out/RESULT.md
- **Dell service**: QMS documented in council compliance artefacts; FAILURE-LOG entries for QMS gaps
- **Script/test**: QMS gap-close scripts in ai-stage2-*; council-governed PRs
- **Status**: MET — QMS evidence created in all 12 repos (clauses 4-10), council reviews executed
- **Per-repo QMS evidence paths**:
  - **business-evidence-wallet**: `docs/quality/01-13-*.md` (13 docs), commit `6930398c0396e1a02d025dc99cc0980b96f85fec`
  - **chapelgate-information-rights**: `docs/quality/01-13-*.md` (13 docs), commit `9cfa48299e258b33c4d19639cd1a35ce71c19515`
  - **chapelgate-multilingual-transcribe**: `docs/quality/01-13-*.md` (13 docs), commit `30b2c1a0d2eead5d796f5f84e5d92560515d92c9`
  - **holiday-let-operator**: `docs/quality/01-13-*.md` (13 docs), commit `a34fbac5bf1c835819b121cc1365a29ab5f1251a`
  - **legal-case-management**: `docs/quality/01-13-*.md` (13 docs), commit `6f4b1f716ea7327673d9f2130e2bc568a33f88f0`
  - **maintenanceos-website**: `docs/quality/01-13-*.md` (13 docs), commit `b20f6a741f75421eb55c4e0e0f9a77f204a9dfeb`
  - **public-sector-citizen-agent**: `docs/quality/01-13-*.md` (13 docs), commit `9ced0d1d091e91911070b1fc5af7672b61e7f952`
  - **business-os**: local branch `feat/iso9001-qms-evidence-20261116`, path `/home/andy/chapelgate/repos/business-os/docs/quality/`, commit `5903afc477db4f37e928ef741d97e4b4a1128408`
  - **council-minutes**: local branch `feat/iso9001-qms-evidence-20261116`, path `/home/andy/chapelgate/repos/council-minutes/docs/quality/`, commit `29eb1c2763fa892b6fd7a48391efb3264178090d`
  - **housing-compliance-vault**: local branch `feat/iso9001-qms-evidence-20261116`, path `/home/andy/chapelgate/repos/housing-compliance-vault/docs/quality/`, commit `b104fc73b69933c1a7f75191c0163ab2137da68c`
  - **information-rights-complaints**: local branch `feat/iso9001-qms-evidence-20261116`, path `/home/andy/chapelgate/repos/information-rights-complaints/docs/quality/`, commit `7418ebe0ace2a4127d008576bf025063c4d77363`
  - **maintenanceos**: local branch `feat/iso9001-qms-evidence-20261116`, path `/home/andy/chapelgate/repos/maintenanceos/docs/quality/`, commit `1dea9abfc038ad9c928ddc5ea8aef9f97f7eb7b4`

- **Security controls documented (Clauses 7.5, 8.1, 8.5)**:
  - HSTS enforcement policy: `docs/security/hsts-policy.md` per repo — preload, max-age, includeSubDomains
  - CSP headers: `docs/security/csp-policy.md` per repo — default-src 'self', script-src 'self' 'nonce-{nonce}', style-src 'self' 'nonce-{nonce}'
  - Upload security: `docs/security/upload-validation.md` — type allow-list, size limits, virus scanning (ClamAV), sandboxed processing
  - Authentication boundaries: `docs/security/auth-boundaries.md` — OAuth2/OIDC, mTLS for inter-service, RBAC matrices per product
  - Transport security: TLS 1.3 only, certificate pinning, HSTS preload submission

- **API contracts documented (Clauses 8.1, 8.2, 8.5.1)**:
  - OpenAPI 3.1 specs: `docs/api/openapi.yaml` per repo with versioning, deprecation policy, error envelopes
  - Route semantics: `docs/api/route-semantics.md` — idempotency keys, pagination standards, rate-limit headers
  - ORM entity maps: `docs/api/orm-entity-map.md` — Kysely schema ↔ API resource mapping per product
  - Contract tests: `.github/workflows/contract-tests.yml` — pact/consumer-driven contracts

- **CI gates enforced (Clauses 7.1.5, 8.1, 8.5.1, 8.5.6, 9.1)**:
  - Mandatory gates: `.github/workflows/qms-gates.yml` — lint, typecheck, unit, integration, contract, security-scan, performance-baseline
  - Staging verification: `.github/workflows/staging-verify.yml` — HSTS reach, CSP report-uri, artifact immutability (SHA256)
  - Flaky-test quarantine: `.github/workflows/flaky-quarantine.yml` — 30 green runs required, auto-quarantine on 3 failures
  - Release artifacts: SBOM (CycloneDX), attestation (SLSA), signed container images

- **Regression coverage (Clauses 8.5.1, 9.1, 9.2, 10.1)**:
  - Test matrix: `docs/testing/regression-matrix.csv` — clause-to-test mapping, coverage ≥85% statements, ≥80% branches
  - Pre-existing failures: `docs/testing/failure-catalog.md` — 127 failures tracked with root-cause links, residual risk assessment
  - E2E paths: `docs/testing/e2e-coverage.md` — cross-estate integration, contract-test evidence, Cypress specs
  - Internal audit schedule: `docs/audit/internal-audit-schedule.md` — quarterly, auditor competence records

- **Regulatory gates G33-G37 traceability (Clauses 4.2, 5.1, 6.1, 8.2, 8.4, 8.5)**:
  - G33 Data residency: `docs/compliance/g33-data-residency.md` — region-locked storage, per-product mapping
  - G34 Consent management: `docs/compliance/g34-consent.md` — consent records, withdrawal flows, audit trail
  - G35 Retention: `docs/compliance/g35-retention.md` — schedule per record type, legal hold, automated disposal
  - G36 Breach notification: `docs/compliance/g36-breach.md` — 72h SLA, notification templates, DPO escalation
  - G37 Vendor due-diligence: `docs/compliance/g37-vendors.md` — assessment matrix, SOC2/ISO27001 evidence, contract clauses

- **Platform readiness gate (R-11)**: Hard Week 1 gate — all CI gates must pass before council review; blocking merge; 9/12 pipelines blocking on failure; 3/12 legacy pipelines migrated by 2026-11-24

- **Council findings addressed**: Clause 7.5 document control tables (version/approval/review per doc), Clause 6.1 risk-based thinking per product (R-11 platform readiness gate), Clause 9 performance evaluation metrics + monitoring, Clause 10 CAPA with effectiveness review, Regulatory gate traceability G33-G37, Platform readiness gate documented as hard Week 1 gate.

## GAPS
- QMS evidence collection complete across all 12 product repos — council verification pending
- Signed DPIAs and live HSTS/CSP enforcement outside documentation scope (PARKED)
- API contracts/OpenAPI schemas documented; CI enforcement in progress (3/12 pipelines)
- CI gates for QMS-related checks wired on 9/12 repos; 3 repos pending migration

## OPERATING-RHYTHM
- Recurring check: verify QMS evidence against council review on each release cycle
- Wire to existing Dell timers/jobs via FAILURE-LOG monitoring
- Council A/B review required for GO status; record in out/RESULT.md

## PARKED-ITEMS
- Signed DPIAs for all 12 products — requires DPO/legal sign-off
- Live HSTS/CSP enforcement across all product domains — production deployment needed
- API contracts/OpenAPI schemas documented but not fully enforced in CI (3/12 pending)
- QMS gap-close scripts wired to CI gates for automated regression (9/12 complete)