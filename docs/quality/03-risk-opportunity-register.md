# Risk and Opportunity Register (ISO 9001:2015 Clause 6.1)

## Product: maintenanceos-website

### Risk Assessment Methodology
- **Likelihood**: 1 (Rare) to 5 (Almost Certain)
- **Impact**: 1 (Negligible) to 5 (Catastrophic)
- **Risk Score**: Likelihood × Impact (1-25)
- **Threshold**: ≥15 = High (requires treatment plan); 8-14 = Medium (monitor); ≤7 = Low (accept)

---

## Risks

| ID | Risk Description | Clause | Likelihood | Impact | Score | Owner | Treatment / Mitigation | Evidence | Status |
|----|------------------|--------|------------|--------|-------|-------|------------------------|----------|--------|
| R-01 | Critical vulnerability in dependencies | 8.1, 8.4 | 3 | 5 | 15 | Security | Vulnerability scanning in CI; Dependabot alerts; council review blocks merge on HIGH/CRITICAL | CI workflow vulnerability scans | Active |
| R-02 | CI gate bypass / self-merge | 8.1, 8.5.1 | 2 | 5 | 10 | Council | Branch protection: require status checks, 2 council approvals, no self-merge | GitHub branch protection rules; `out/council-*/council-*.md` | Active |
| R-03 | Regression suite gaps / pre-existing failures | 9.1, 10.1 | 3 | 4 | 12 | QA | Full test suite in CI; independent verifier runs 10 journeys + Terry + 5 red-team; FAILURE-LOG tracks all | CI test workflows, `out/VERIFIER-FEEDBACK.md`, FAILURE-LOG | Active |
| R-04 | OmniRoute model provider failure / fallback failure | 8.4 | 2 | 4 | 8 | Engineering | OmniRoute caching/fallback configured; free models only; local instance 127.0.0.1:20128 isolated | OmniRoute config, readiness docs | Monitor |
| R-05 | Database migration failure / schema drift | 8.5.1 | 2 | 5 | 10 | Engineering | Migrations tracked; rollback tested in CI; lockfiles pin deps | Migration files, lockfiles, CI | Active |
| R-06 | Authentication bypass / session fixation | 8.1, A.9 | 2 | 5 | 10 | Security | Auth controls; security testing per release | Security workflows, PentAGI reports | Active |
| R-07 | Evidence tampering / audit trail corruption | 7.5, 8.2 | 1 | 5 | 5 | Engineering | Append-only logs; git commit history; council verdicts immutable | Git history, council verdicts | Low |
| R-08 | Council review fatigue / rubber-stamp | 9.3, 10.1 | 2 | 3 | 6 | Council | Rotating personas; mandatory debate rounds; Roastroom second opinion | Council review scripts, Roastroom | Monitor |
| R-09 | Secrets exposure in CI / logs | 8.1, A.8 | 2 | 5 | 10 | Security | No secrets in repo; local auth secret generation; `.env.example` only | CI workflows, startup scripts | Active |
| R-10 | Performance degradation undetected | 9.1 | 3 | 3 | 9 | QA | No perf benchmarks in CI yet — GAP | — | GAP |

---

## Opportunities

| ID | Opportunity Description | Clause | Benefit | Owner | Action | Evidence | Status |
|----|-------------------------|--------|---------|-------|--------|----------|--------|
| O-01 | Automate performance benchmarks in CI | 9.1, 10.1 | Early regression detection | Engineering | Add benchmark workflow with p50/p95 latency tracking | — | Planned |
| O-02 | Extend PentAGI to cover auth flows | 8.1, 10.1 | Deeper security validation | Security | Configure PentAGI scenarios for login, token refresh, RBAC | pentagi-security-testing skill | Planned |
| O-03 | SBOM generation for supply chain transparency | 8.4, A.10 | Tender readiness | Engineering | SBOM workflow → CycloneDX SBOM attached to releases | SBOM workflow if exists | Planned |
| O-04 | Council review automation for trivial docs | 9.3 | Faster cycle time | Council | Auto-GO for docs-only changes with green CI | — | Planned |
| O-05 | FAILURE-LOG auto-triage by category | 10.1, 10.2 | Faster root cause | Engineering | Script to classify failures (flaky, env, code, config) | FAILURE-LOG | Planned |

---

## Risk Review Schedule
- **Per PR**: Council reviews risks affected by changes (blast-radius)
- **Per release**: Full register review in management review (Clause 9.3)
- **Per foreman cycle**: FAILURE-LOG ageing check → new risks if pattern emerges
- **Annual**: Full risk register refresh (Andy + Council)

---

## Evidence Links
- FAILURE-LOG: `/root/jobs-work/readiness/FAILURE-LOG.md`
- Council verdicts: `out/council-a/council-A.md`, `out/council-b/council-B.md`
- CI workflows: `.github/workflows/*.yml`
- PentAGI reports: `out/PENTAGI-REPORT.md`
- Vulnerability scans: CI workflow outputs
