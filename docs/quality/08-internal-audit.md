# Internal Audit Procedure and Plan (ISO 9001:2015 Clause 9.2)

## Product: maintenanceos-website

### 9.2.1 Audit Programme
Chapelgate maintains an internal audit programme to determine whether the QMS:
- Conforms to ISO 9001:2015 requirements and Chapelgate's own QMS requirements
- Is effectively implemented and maintained

#### Audit Schedule
| Audit | Frequency | Scope | Auditor | Evidence |
|-------|-----------|-------|---------|----------|
| **Full QMS audit** | Per release cycle | All clauses 4–10, all docs/quality/* | Council (A+B) + independent verifier | Audit report (docs/quality/11-audit-report-template.md) |
| **Clause-focused audit** | Per foreman cycle (2h) | 1–2 clauses (rotating) | Council persona assigned | FAILURE-LOG entry + council note |
| **Supplier audit** | Per release | OmniRoute, GitHub, registries, Docker | Security persona | out/SUPPLIER-AUDIT-<date>.md |
| **Process audit** | Triggered by FAILURE-LOG pattern | Specific process (CI, review, deploy) | Engineer + council | out/PROCESS-AUDIT-<date>.md |
| **Follow-up audit** | 2 cycles after CAPA closure | Corrective action effectiveness | Original auditor | CAPA log effectiveness result |

#### Audit Criteria
- ISO 9001:2015 clauses 4–10
- This repo's QMS documents (docs/quality/*)
- Council verdicts (out/council-*/council-*.md)
- FAILURE-LOG (/root/jobs-work/readiness/FAILURE-LOG.md)
- CI/CD pipeline configuration (.github/workflows/*.yml)
- Verifier feedback (out/VERIFIER-FEEDBACK.md)
- PentAGI/ZAP/Shannon reports (out/PENTAGI-REPORT.md, etc.)

---

### 9.2.2 Audit Process

#### 1. Audit Initiation
- **Trigger**: Schedule, FAILURE-LOG pattern, Andy directive, council request
- **Audit plan**: Written in out/AUDIT-PLAN-<YYYYMMDD>.md with scope, criteria, auditor, timeline
- **Notification**: Andy + Council via ANDY-BRIEFING.md append

#### 2. Audit Preparation
- Auditor reviews: Criteria documents, prior audit reports, FAILURE-LOG entries for scope
- Checklist prepared: out/AUDIT-CHECKLIST-<YYYYMMDD>.md (clause → question → evidence sought)

#### 3. Audit Execution
- **Evidence gathering**: Document review, log inspection, interview (async via PR/comments), tool output
- **Findings recorded**: Per clause — CONFORMITY / NONCONFORMITY / OBSERVATION / OPPORTUNITY
- **Nonconformities**: Immediately logged to FAILURE-LOG with [AUDIT] prefix

#### 4. Audit Report
- **Template**: docs/quality/11-audit-report-template.md
- **Contents**: Scope, criteria, auditor, date, findings (with evidence refs), conclusion, recommendations
- **Distribution**: Andy, Council, Verifier — via ANDY-BRIEFING.md + out/

#### 5. Follow-up
- Nonconformities → CAPA process (Clause 10.2)
- Observations → Risk register update (Clause 6.1)
- Recommendations → Council review for implementation
- Effectiveness verified at next scheduled audit

---

### Audit Plan (Next 6 Cycles)

| Cycle | Date (approx) | Audit Type | Scope (Clauses) | Auditor | Status |
|-------|---------------|------------|-----------------|---------|--------|
| 1 | 2026-11-16 | Full QMS | 4–10 (all) | Council A+B + Verifier | PLANNED |
| 2 | 2026-11-16 | Clause-focused | 8.3 (Design), 8.5 (Production) | Security persona | PLANNED |
| 3 | 2026-11-17 | Clause-focused | 9.1 (Monitoring), 10.1 (Improvement) | QA persona | PLANNED |
| 4 | 2026-11-17 | Supplier | OmniRoute, GitHub, registries | Security persona | PLANNED |
| 5 | 2026-11-18 | Process | CI gate enforcement, council merge | Release persona | PLANNED |
| 6 | 2026-11-18 | Follow-up | CAPA effectiveness (from Cycle 1) | Original auditor | PLANNED |

---

### Auditor Competence and Independence
- **Competence**: ISO 9001 awareness (training record), product knowledge, audit methodology
- **Independence**: Auditor does not audit their own work; Council personas rotate; verifier independent
- **Records**: Training records in docs/quality/12-training-record-template.md

---

### Evidence in This Repo
| Element | Evidence Path |
|---------|---------------|
| Audit programme | This document (docs/quality/08-internal-audit.md) |
| Audit plans | out/AUDIT-PLAN-*.md |
| Audit checklists | out/AUDIT-CHECKLIST-*.md |
| Audit reports | out/AUDIT-REPORT-*.md (using template docs/quality/11-audit-report-template.md) |
| FAILURE-LOG audit entries | /root/jobs-work/readiness/FAILURE-LOG.md (search "AUDIT") |
| CAPA from audits | docs/quality/10-capa-log-template.md |
| Training records | docs/quality/12-training-record-template.md |
| ANDY-BRIEFING audit notifications | /home/andy/chapelgate/jobs-work-dell/ANDY-BRIEFING.md |
