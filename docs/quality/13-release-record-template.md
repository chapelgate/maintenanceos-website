# Release Record Template (ISO 9001:2015 Clause 8.5.1, 8.6)

## Product: maintenanceos-website

### Purpose
Record evidence that each release meets planned arrangements and is authorised for deployment.

---

## Release Record

### Identification
| Field | Value |
|-------|-------|
| **Release ID** | maintenanceos-website-REL-<YYYYMMDD>-<NN> |
| **Version** | v<MAJOR.MINOR.PATCH> (semver) |
| **Git Tag** | <tag name, e.g., v1.2.3> |
| **Commit Hash** | <full SHA256 of merge commit> |
| **Branch** | main |
| **Release Date** | <YYYY-MM-DD HH:MM UTC> |
| **Release Type** | MAJOR / MINOR / PATCH / HOTFIX / RC |
| **Authorised By** | Council GO reference (out/council-*/council-*.md) |

### Release Content
| Category | Items | Evidence |
|----------|-------|----------|
| Features | <List from CHANGELOG/acceptance docs> | PR #s, commits |
| Fixes | <List from FAILURE-LOG/CAPA> | PR #s, commits |
| Security | <Vulnerabilities addressed> | vuln-scan, PentAGI, ZAP refs |
| Docs | <QMS docs updated> | docs/quality/* commits |
| Dependencies | <Upgraded deps> | Dependabot PRs, lockfile diffs |

### Verification Evidence (Clause 8.6)

#### Council Review
| Council | Verdict | Date | Reference |
|---------|---------|------|-----------|
| Council A | GO / FAIL | <date> | out/council-a/council-A.md line <N> |
| Council B | GO / FAIL | <date> | out/council-b/council-B.md line <N> |
| Roastroom | Advisory | <date> | /root/jobs-work/councils/roastroom/out/ROASTROOM-VERDICT.md |

#### Verifier Sign-off
| Verification | Result | Date | Evidence |
|--------------|--------|------|----------|
| 10 human-persona journeys | PASS / FAIL | <date> | out/VERIFIER-FEEDBACK.md |
| Terry cases (3 failures) | PASS / FAIL | <date> | out/VERIFIER-FEEDBACK.md |
| Red-team run 1 (PentAGI) | PASS / FAIL | <date> | out/PENTAGI-REPORT.md |
| Red-team run 2 (ZAP) | PASS / FAIL | <date> | out/ZAP-REPORT.md |
| Red-team run 3 (Shannon, staging) | PASS / FAIL | <date> | out/SHANNON-REPORT.md |
| Red-team run 4 (Full Shakedown) | PASS / FAIL | <date> | shakedown/CHECKLIST.md |
| Red-team run 5 (Cloudflare audit) | PASS / FAIL | <date> | out/CLOUDFLARE-AUDIT.md |

#### CI Gates (All Must Be Green)
| Gate | Workflow | Run ID | Status | Evidence |
|------|----------|--------|--------|----------|
| Estate gate | estate-gate.yml | <run-id> | PASS | GitHub Actions |
| Release gate | release workflow | <run-id> | PASS | GitHub Actions |
| OpenCode | opencode.yml | <run-id> | PASS | GitHub Actions |
| Vulnerability scan | vuln-scan.yml | <run-id> | PASS | Vulnerability scan output |
| SBOM | sbom.yml | <run-id> | PASS | out/sbom-<version>.json |

#### Test Results
| Suite | Coverage | Pass Rate | Evidence |
|-------|----------|-----------|----------|
| Unit | ≥90% stmt, ≥85% branch | 100% | coverage/ |
| Integration | N/A | 100% | out/integration-<run-id>.log |
| Mutation (if applicable) | ≥80% | N/A | mutation log |

### Release Artefacts
| Artefact | Location | Hash (SHA256) | Verified |
|----------|----------|---------------|----------|
| Source tarball | GitHub Release | <hash> | YES |
| Docker image | GHCR/Docker Hub | <digest> | YES |
| SBOM | GitHub Release / out/sbom-<version>.json | <hash> | YES |
| Test reports | GitHub Release / out/ | <hash> | YES |
| Security reports | GitHub Release / out/ | <hash> | YES |

### Deployment Authorisation
| Environment | Authorised | Authoriser | Date | Method |
|-------------|------------|------------|------|--------|
| Staging (Dell) | YES/NO | Council | <date> | Auto on main merge |
| Production | PARKED | Andy only | — | Manual (HB items) |

### Known Issues / Limitations
| Issue | Severity | Workaround | FAILURE-LOG Ref | Target Fix |
|-------|----------|------------|-----------------|------------|
| | | | | |

### Post-Release Monitoring (Clause 9.1)
- Health endpoint monitoring
- Latency p50/p95 recording
- Error rate tracking
- FAILURE-LOG watch: 48h enhanced monitoring

### Sign-off
| Role | Name | Reference | Date |
|------|------|-----------|------|
| Release Engineer | | | |
| Council A Lead | | out/council-a/council-A.md | |
| Council B Lead | | out/council-b/council-B.md | |
| Verifier | | out/VERIFIER-FEEDBACK.md | |
| Andy (Production only) | | ANDY-BRIEFING.md | |

---

## Record Keeping
- **Completed record**: Saved as out/maintenanceos-website-REL-<YYYYMMDD>-<NN>.md
- **Retention**: Permanent (release evidence)
- **Linked from**: GitHub Release description, CHANGELOG.md
- **Distribution**: Andy, Council, Verifier via ANDY-BRIEFING.md
