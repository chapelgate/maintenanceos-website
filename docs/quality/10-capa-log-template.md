# CAPA Log Template (ISO 9001:2015 Clause 10.2)

## Product: maintenanceos-website

### Instructions
- One entry per corrective/preventive action
- Link to FAILURE-LOG entry (date + build + task)
- Complete all fields before council review
- Council GO required for closure
- Effectiveness check at 2 foreman cycles post-closure

---

## CAPA Entry

### Identification
| Field | Value |
|-------|-------|
| **CAPA ID** | maintenanceos-website-CAPA-<YYYYMMDD>-<NN> |
| **Date Opened** | <YYYY-MM-DD HH:MM UTC> |
| **Nonconformity Ref** | FAILURE-LOG: <YYYY-MM-DD> | <BUILD> | <TASK> |
| **Title** | <Brief descriptive title> |
| **Classification** | CORRECTIVE / PREVENTIVE |
| **Severity** | CRITICAL / HIGH / MEDIUM / LOW |

### Root Cause Analysis
| Field | Value |
|-------|-------|
| **Method** | 5 Whys / Fishbone / Blast Radius / Other: <specify> |
| **Root Cause Statement** | <Verified root cause — specific, not symptom> |
| **Contributing Factors** | <List if multiple> |
| **Evidence** | <Links to logs, council verdicts, verifier feedback, code> |

### Corrective/Preventive Action
| Field | Value |
|-------|-------|
| **Action Description** | <Specific change: what, where, how> |
| **PR / Commit** | <PR # and/or commit hash — required for closure> |
| **Owner** | <Role + name> |
| **Target Completion Date** | <YYYY-MM-DD> |
| **Actual Completion Date** | <YYYY-MM-DD> |

### Verification of Implementation
| Field | Value |
|-------|-------|
| **Verification Method** | TEST / SCAN / REVIEW / AUDIT / DEMONSTRATION |
| **Verification Details** | <Exact steps to verify fix works> |
| **Verification Result** | PASS / FAIL |
| **Verification Evidence** | <Links to test output, scan results, review record> |
| **Verified By** | <Role + name> |
| **Verification Date** | <YYYY-MM-DD HH:MM UTC> |

### Effectiveness Review (Mandatory — 2 Foreman Cycles Later)
| Field | Value |
|-------|-------|
| **Effectiveness Check Date** | <YYYY-MM-DD> (auto: 2 cycles after closure) |
| **Recurrence Check** | SEARCH FAILURE-LOG for same root cause since closure |
| **Result** | NO RECURRENCE / RECURRED |
| **If Recurred** | New FAILURE-LOG entry + re-open CAPA |
| **Reviewed By** | Council (management review) |
| **Closure Approved** | YES / NO (Council GO reference) |

### Closure
| Field | Value |
|-------|-------|
| **Closure Date** | <YYYY-MM-DD> |
| **Closed By** | <Role + name> |
| **Council GO Reference** | out/council-*/council-*.md line/date |
| **Lessons Learned** | <Added to risk register? training? procedure update?> |

---

## CAPA Log Index (Append New Entries Here)

| CAPA ID | Date | Title | Status | Closure Date |
|---------|------|-------|--------|--------------|
| | | | | |
| | | | | |
| | | | | |
