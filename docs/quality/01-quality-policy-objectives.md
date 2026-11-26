# Quality Policy and Objectives (ISO 9001:2015 Clauses 5.2, 6.2)

## Product: maintenanceos-website

### Quality Policy

Chapelgate commits to delivering maintenanceos-website as a reliable, auditable estate product. Quality is embedded through:

- **Council-governed changes**: All production changes require dual-council review (Council A + Council B) with explicit GO verdict at exact commit hash
- **Evidence-first engineering**: Every feature ships with verifiable evidence (test results, security scans, performance benchmarks) recorded in `/out/` directories
- **Continuous compliance**: ISO 9001 clauses 4–10 mapped to living artefacts in `docs/quality/`, `readiness/`, and CI gates
- **Failure transparency**: All defects logged in `/root/jobs-work/readiness/FAILURE-LOG.md` with date, build, task, actual vs expected — no silent failures
- **No certification claims**: Shadow QMS documents operational reality; certification audit remains PARKED (Andy-only spend decision)

### Quality Objectives (Measurable, Clause 6.2)

| Objective | KPI | Target | Evidence Path |
|-----------|-----|--------|---------------|
| Zero critical vulnerabilities in release candidates | Vulnerability scan high/critical count | 0 | CI workflow vulnerability scan results |
| All CI gates green before merge | Required status checks pass rate | 100% | GitHub branch protection + `.github/workflows/*.yml` |
| Regression suite coverage | Test execution coverage | ≥90% statements, ≥85% branches | CI test reports (`coverage/`) |
| FAILURE-LOG entries resolved within 2 cycles | FAILURE-LOG ageing | ≤2 foreman cycles | `/root/jobs-work/readiness/FAILURE-LOG.md` |
| Council review completion | Dual-council GO verdicts | 100% of PRs | `out/council-*/council-*.md` |

### Scope of QMS (Clause 4.3)

Applies to the maintenanceos-website repository including:
- Source code in repository root and subdirectories
- CI/CD pipelines in `.github/workflows/`
- Tests in `tests/` or equivalent
- Documentation in `docs/`, `specs/`
- Evidence artefacts in `out/`, `artifacts/`

Exclusions: Dependency directories (`node_modules/`, `.venv/`, `vendor/`), build artefacts, local development databases.

### Context (Clauses 4.1, 4.2)

**Internal context**: Chapelgate estate product; runs on Dell Precision 5820. Language: JavaScript/TypeScript (Node.js). Key workflows: do-readonly-inventory.yml estate-gate.yml factory-test-001.lock.yml factory-test-001.md lighthouse.yml opencode.yml pages.yml promptfoo.yml webkit-a11y.yml website-integration-repair-validation.yml .

**External context**: Model providers via OmniRoute (127.0.0.1:20128); evidence consumers (tender evaluators, auditors). UK GDPR, Cyber Essentials, ISO 27001 alignment expected by buyers.

**Interested parties**: Andy (owner), Chapelgate council (reviewers), future certification body (PARKED), UK public-sector buyers.
