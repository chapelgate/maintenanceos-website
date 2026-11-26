# Management Review Template (ISO 9001:2015 Clause 9.3)

## Product: maintenanceos-website

### Review Information
| Field | Value |
|-------|-------|
| Review ID | maintenanceos-website-MR-<YYYYMMDD>-<NN> |
| Date | <YYYY-MM-DD HH:MM UTC> |
| Chair | Andy (owner) |
| Attendees | Council A lead, Council B lead, Verifier, Security lead, QA lead, Release lead |
| Input documents | See Section 9.3.2 |
| Output decisions | See Section 9.3.3 |

---

## 9.3.2 Review Inputs (Mandatory)

### 1. Status of Actions from Previous Reviews
- **Reference**: Prior maintenanceos-website-MR-*.md action items
- **Status**: CLOSED / IN PROGRESS / OVERDUE
- **Evidence**: Links to PRs, commits, FAILURE-LOG entries

### 2. Changes in External and Internal Issues (Clause 4.1, 4.2)
- **Regulatory**: UK GDPR, Cyber Essentials, ISO 27001 updates
- **Buyer requirements**: Tender criteria changes, new evidence demands
- **Technology**: OmniRoute model updates, language runtime LTS, database version
- **Organisational**: Andy directives, council composition, resource changes

### 3. QMS Performance and Effectiveness
| Metric | Current | Target | Trend | Evidence |
|--------|---------|--------|-------|----------|
| Council GO rate | % | 100% | ↗/↘/→ | out/council-*/council-*.md |
| Verifier PASS rate | % | 100% | ↗/↘/→ | out/VERIFIER-FEEDBACK.md |
| CI gate pass rate | % | 100% | ↗/↘/→ | GitHub Actions |
| FAILURE-LOG open >2 cycles | Count | 0 | ↗/↘/→ | /root/jobs-work/readiness/FAILURE-LOG.md |
| Vulnerability HIGH/CRITICAL | Count | 0 | ↗/↘/→ | Vulnerability scan outputs |
| PentAGI/ZAP findings | Count | 0 critical | ↗/↘/→ | out/PENTAGI-REPORT.md |
| Release frequency | Per month | ≥1 | ↗/↘/→ | GitHub releases |

### 4. Nonconformities and Corrective Actions (Clause 10.2)
- **New nonconformities**: Count since last review (from FAILURE-LOG)
- **CAPA status**: OPEN / IN PROGRESS / VERIFIED / CLOSED
- **Effectiveness**: Recurrence check (2 cycles post-closure)
- **Trends**: Category analysis (security, CI, test, doc, process)

### 5. Audit Results (Clause 9.2)
- **Internal audit findings**: CONFORMITY / NONCONFORMITY / OBSERVATION / OPPORTUNITY
- **Supplier audit findings**: OmniRoute, GitHub, registries, Docker
- **Follow-up status**: Previous audit actions

### 6. Supplier Performance (Clause 8.4)
| Supplier | Status | Issues | Re-evaluation Due |
|----------|--------|--------|-------------------|
| OmniRoute | GREEN/YELLOW/RED | Latency, model availability | <date> |
| GitHub | GREEN/YELLOW/RED | CI latency, feature deprecation | <date> |
| Package registries | GREEN/YELLOW/RED | Vulnerability density, dep age | <date> |
| Docker | GREEN/YELLOW/RED | Base image CVE, LTS status | <date> |

### 7. Resource Adequacy (Clause 7.1)
- **Compute**: Dell Precision 5820 capacity (CPU, RAM, disk)
- **OmniRoute**: Container health, model latency
- **Human**: Engineer availability, council capacity, verifier bandwidth
- **Tools**: OpenCode, gh, OmniRoute, PentAGI, ZAP, Shannon (staging)

### 8. Risk and Opportunity Status (Clause 6.1)
- **Risk register**: docs/quality/03-risk-opportunity-register.md — High risks review
- **New risks**: From FAILURE-LOG, audits, external changes
- **Opportunities**: Implemented, planned, rejected

### 9. Improvement Opportunities (Clause 10.1)
- **From verifier**: out/VERIFIER-FEEDBACK.md recommendations
- **From council**: ROASTROOM-VERDICT.md, council debate insights
- **From FAILURE-LOG**: Pattern-based improvements
- **From Andy**: ANDY-BRIEFING.md directives

---

## 9.3.3 Review Outputs (Decisions and Actions)

### Decisions Recorded
| Decision ID | Description | Rationale | Owner | Target Date | Status |
|-------------|-------------|-----------|-------|-------------|--------|
| maintenanceos-website-MR-<NN>-D01 | ... | ... | ... | ... | OPEN |

### Actions Arising
| Action ID | Description | Owner | Target Date | Evidence of Completion |
|-----------|-------------|-------|-------------|------------------------|
| maintenanceos-website-MR-<NN>-A01 | ... | ... | ... | PR #, commit, report |

### QMS Changes Approved
- Procedure updates (docs/quality/*)
- Risk register updates
- Resource allocations
- Schedule changes

### Communication
- **Andy**: This review appended to ANDY-BRIEFING.md (one line)
- **Council**: Minutes in out/council-*/council-*.md (next review)
- **Verifier**: Notified via out/VERIFIER-FEEDBACK.md context
- **Engineering**: STEER.md if process change required

---

## Evidence Package for This Review
| Document | Path |
|----------|------|
| Previous review actions | out/maintenanceos-website-MR-<prev>.md |
| FAILURE-LOG entries | /root/jobs-work/readiness/FAILURE-LOG.md (date range) |
| Council verdicts | out/council-*/council-*.md (date range) |
| Verifier feedback | out/VERIFIER-FEEDBACK.md (date range) |
| Audit reports | out/AUDIT-REPORT-*.md |
| Vulnerability scans | CI vulnerability outputs |
| PentAGI/ZAP reports | out/PENTAGI-REPORT.md, out/ZAP-REPORT.md |
| CI gate history | GitHub Actions (date range) |
| Risk register | docs/quality/03-risk-opportunity-register.md |
| ANDY-BRIEFING | /home/andy/chapelgate/jobs-work-dell/ANDY-BRIEFING.md |

---

## Record Keeping
- **This template**: Completed copy saved as out/maintenanceos-website-MR-<YYYYMMDD>-<NN>.md
- **Retention**: Permanent (governance evidence)
- **Access**: Andy, Council, Verifier, Auditors (on request)
