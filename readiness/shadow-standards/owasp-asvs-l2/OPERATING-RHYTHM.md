# Operating Rhythm — OWASP ASVS 5.0 Level 2

Purpose: Recurring checks that keep ASVS L2 compliance true day to day, wired to existing Dell timers/jobs where possible.

## Daily (automated in CI/CD)

| Check | Tool | Trigger | Evidence location | Owner |
|-------|------|---------|-------------------|-------|
| Semgrep SAST scan | semgrep --config auto | PR merge / daily schedule | jobs-work-dell/readiness/semgrep/ | DevOps |
| gitleaks secret scan | gitleaks | PR merge / daily schedule | jobs-work-dell/readiness/gitleaks/ | DevOps |
| Dependency scan (SBOM) | dependency-check / syft | PR merge / daily schedule | jobs-work-dell/sbom/ | DevOps |

## Weekly (automated)

| Check | Tool | Trigger | Evidence location | Owner |
|-------|------|---------|-------------------|-------|
| ZAP baseline DAST scan | zap-baseline.py (Docker container) | Weekly cron | jobs-work-dell/readiness/zap/ | Security |
| Full semgrep scan (all 12 products) | semgrep | Weekly cron | jobs-work-dell/readiness/semgrep/ | Security |
| gitleaks full repo scan | gitleaks | Weekly cron | jobs-work-dell/readiness/gitleaks/ | Security |

## Per-release (on deployment)

| Check | Tool | Trigger | Evidence location | Owner |
|-------|------|---------|-------------------|-------|
| Full ASVS L2 checklist walk-through | Manual + automated | Release gate | Release notes; jobs-work-dell/readiness/shadow-standards/owasp-asvs-l2/ | Security |
| Semgrep/ZAP findings triage | Manual | Release gate | jobs-work-dell/readiness/semgrep/, jobs-work-dell/readiness/zap/ | Security |

## Quarterly (scheduled)

| Check | Tool | Trigger | Evidence location | Owner |
|-------|------|---------|-------------------|-------|
| Threat model review (V15.1.1) | Manual | Quarterly | Product repos docs/threat-model/ | Security |
| ASVS L2 self-assessment update | Manual review | Quarterly | jobs-work-dell/readiness/shadow-standards/owasp-asvs-l2/ | Security |
| Third-party penetration test | External | Annual | TENDER-REGISTER.md | Andy |

## Council review (per BRIEF.md)

| Review | Participants | Cadence | Evidence | Output |
|--------|--------------|---------|----------|--------|
| Council A/B + Roastroom | Model makers A/B + 7 business advisors | Per PR / per product fix | out/council-A.md, out/council-B.md, out/roastroom/ | MERGE / BLOCK at exact head |

## Wired to existing Dell jobs/timers

- **BUILD-HOURLY.md** (jobs-work-dell/): CI runs on PR merge → covers daily semgrep, gitleaks, dependency scans
- **dell-watch/**: Monitors deployment health → covers per-release ASVS checks
- **jobs-work/readiness/FAILURE-LOG.md**: All failures logged per STRICT rule t1081u
- **PentAGI security testing** (skill pentagi-security-testing): Runs on all testing jobs per t1058u
- **Full Shakedown** (shakedown/CHECKLIST.md): Required before any release

## Free scanner evidence targets (ASVS L2 specific)

| Scanner | Target | Output dir | Frequency |
|---------|--------|------------|-----------|
| semgrep | All 12 product repos (SAST) | jobs-work-dell/readiness/semgrep/ | Daily + PR |
| gitleaks | All 12 product repos (secrets) | jobs-work-dell/readiness/gitleaks/ | Daily + PR |
| ZAP baseline | Running product staging URLs (DAST) | jobs-work-dell/readiness/zap/ | Weekly |
| dependency-check / syft | Dependencies (SBOM) | jobs-work-dell/sbom/ | Daily + PR |

## Status tracking

- SHADOW-TEMPLATE.md status column updated after each scanner run
- GAPS.md status column updated when fix merged and verified
- OPERATING-RHYTHM.md reviewed quarterly by Security + Andy
