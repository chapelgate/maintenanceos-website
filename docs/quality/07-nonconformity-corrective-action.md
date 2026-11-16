# Nonconformity and Corrective Action Procedure (ISO 9001:2015 Clause 10.2)

## Product: maintenanceos-website

### Purpose
Define how nonconformities are detected, recorded, investigated, corrected, and prevented from recurrence — linked to the estate FAILURE-LOG.md.

---

## 10.2.1 Nonconformity Detection
Nonconformities are detected through:
| Source | Detection Mechanism | Evidence |
|--------|---------------------|----------|
| CI gate failure | .github/workflows/*.yml status checks | GitHub Actions logs |
| Verifier rejection | out/VERIFIER-FEEDBACK.md = REJECT | Verifier output |
| Council FAIL verdict | out/council-*/council-*.md | Council verdict |
| PentAGI/ZAP finding | out/PENTAGI-REPORT.md, out/ZAP-REPORT.md | Security tool output |
| FAILURE-LOG pattern | /root/jobs-work/readiness/FAILURE-LOG.md ageing >2 cycles | FAILURE-LOG entry |
| Production incident | Monitoring alerts (health, latency, errors) | dell-services/*-run.sh logs |
| Audit finding | Internal audit report (docs/quality/11-audit-report-template.md) | Audit report |
| Customer complaint | Tender feedback, issue reports | ANDY-BRIEFING.md append |

---

## 10.2.2 Nonconformity Recording (FAILURE-LOG)
**Every nonconformity MUST be logged in /root/jobs-work/readiness/FAILURE-LOG.md** with:
```
## <YYYY-MM-DD> | <BUILD-NAME> | <TASK>
**What the agent did**: <actual behaviour>
**What it should have done**: <expected behaviour>
**Root cause** (if known): <analysis>
**Containment**: <immediate action>
**Corrective action**: <planned fix>
**Verification**: <how fix will be verified>
**Status**: OPEN / IN PROGRESS / VERIFIED / CLOSED
**Links**: PR #, commit, council verdict, verifier feedback
```

### FAILURE-LOG Fields (Mandatory)
| Field | Description | Example |
|-------|-------------|---------|
| Date | UTC timestamp of detection | 2026-11-16 14:23 UTC |
| Build | Full build name (folder in tasks/) | dell-fix-maintenanceos-website |
| Task | Specific task within build | vuln-scan gate failure |
| Agent action | What the bot/engineer actually did | Claimed PASS with HIGH vulns |
| Expected | What should have happened | Block merge on HIGH/CRITICAL |
| Root cause | 5 Whys or fishbone result | vuln-scan.yml threshold not enforced |
| Containment | Immediate mitigation | Manual block added to PR |
| Corrective action | Permanent fix | Fix vuln-scan.yml gate logic |
| Verification | How fix proven | Re-run vuln-scan on test PR |
| Status | Current state | VERIFIED |
| Links | Traceability | PR #42, commit abc123, council-B.md |

---

## 10.2.3 Correction (Immediate Action)
- **Containment**: Stop the nonconforming output (block merge, revert deploy, disable feature)
- **Responsibility**: Engineer who detected it + council notification
- **Timeline**: Immediate (same foreman cycle)
- **Evidence**: FAILURE-LOG entry + PR comment + ANDY-BRIEFING.md append

---

## 10.2.4 Corrective Action (Root Cause Elimination)

### Process
1. **Root cause analysis**: 5 Whys / fishbone / blast-radius analysis
2. **Action plan**: Specific, measurable, assigned, dated
3. **Implementation**: Code/config/doc change via council-reviewed PR
4. **Verification**: Independent verifier confirms fix + no regression
5. **Effectiveness review**: After 2 foreman cycles — no recurrence

### Corrective Action Record (CAPA Log)
Use template: docs/quality/10-capa-log-template.md

| Field | Description |
|-------|-------------|
| CAPA ID | maintenanceos-website-CAPA-<YYYYMMDD>-<NN> |
| Nonconformity ref | FAILURE-LOG line number / date |
| Root cause | Verified root cause statement |
| Corrective action | Specific change (PR #, commit) |
| Owner | Role + name |
| Target date | YYYY-MM-DD |
| Verification method | Test, scan, review, audit |
| Verification result | PASS / FAIL + evidence |
| Effectiveness check date | YYYY-MM-DD (2 cycles later) |
| Effectiveness result | NO RECURRENCE / RECURRED |
| Closure date | YYYY-MM-DD |
| Approved by | Council GO reference |

---

## 10.2.5 Preventive Action (Clause 10.2.1 d, e)
- **Trend analysis**: FAILURE-LOG reviewed per foreman cycle for patterns
- **Risk register update**: New risks added to docs/quality/03-risk-opportunity-register.md
- **Process improvement**: Procedure updates via council-reviewed PR
- **Training**: Lessons learned → training record (docs/quality/12-training-record-template.md)

---

## 10.2.6 Review of Corrective Action Effectiveness
- **When**: 2 foreman cycles after closure (approx 4 hours)
- **Who**: Council (review in management review, Clause 9.3)
- **Criteria**: Zero recurrence of same root cause
- **Evidence**: FAILURE-LOG search for same root cause; CAPA log effectiveness result
- **If failed**: Re-open CAPA; escalate to Andy via ANDY-BRIEFING.md

---

## Integration with Estate FAILURE-LOG
- **Single source of truth**: /root/jobs-work/readiness/FAILURE-LOG.md (Dell)
- **This repo's nonconformities**: Logged there with prefix [maintenanceos-website]
- **Cross-repo visibility**: All 12 products log to same FAILURE-LOG
- **Foreman monitoring**: eggbot/watchdog scans FAILURE-LOG continuously
- **Andy briefing**: One-line append per nonconformity to ANDY-BRIEFING.md

---

## Escalation Path
| Severity | Trigger | Escalation | Timeline |
|----------|---------|------------|----------|
| Critical | Security exploit, data loss, certification risk | Andy direct (voice) + Council emergency | Immediate |
| High | CI gate bypass, verifier REJECT, council FAIL | Council review + CAPA | Same cycle |
| Medium | FAILURE-LOG ageing >2 cycles, pattern | Council review in management review | Next review |
| Low | Documentation gap, minor process deviation | Engineer fix + verifier | Next PR |

---

## Evidence in This Repo
| Control | Evidence Path |
|---------|---------------|
| FAILURE-LOG linkage | /root/jobs-work/readiness/FAILURE-LOG.md (search "maintenanceos-website") |
| CAPA log template | docs/quality/10-capa-log-template.md |
| Verifier feedback | out/VERIFIER-FEEDBACK.md |
| Council verdicts | out/council-*/council-*.md |
| PentAGI/ZAP reports | out/PENTAGI-REPORT.md, out/ZAP-REPORT.md |
| ANDY-BRIEFING | /home/andy/chapelgate/jobs-work-dell/ANDY-BRIEFING.md |
| Effectiveness reviews | Management review records (docs/quality/09-management-review-template.md) |
