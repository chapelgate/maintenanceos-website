# Document Control Procedure (ISO 9001:2015 Clause 7.5)

## Product: maintenanceos-website

### Scope
Applies to all documented information required by the QMS and ISO 9001:2015 clauses 4–10, including:
- Quality policy, objectives, scope (`docs/quality/01-quality-policy-objectives.md`)
- Procedures and work instructions (`docs/quality/02-roles-responsibilities.md` through `13-release-record-template.md`)
- Records (audit reports, CAPA logs, training records, release records)
- External documents (ISO 9001 standard, UK GDPR, Cyber Essentials requirements)
- Council verdicts, FAILURE-LOG, ANDY-BRIEFING.md

### Document Identification
Each controlled document has:
- **Unique ID**: `maintenanceos-website-QMS-XX` (XX = sequential number)
- **Title**: Descriptive name
- **Version**: Semantic version (MAJOR.MINOR.PATCH)
- **Status**: DRAFT / UNDER REVIEW / APPROVED / OBSOLETE
- **Owner**: Role responsible for content
- **Location**: Repository path (this repo) or external reference

Example:
```
ID: maintenanceos-website-QMS-01
Title: Quality Policy and Objectives
Version: 1.0.0
Status: APPROVED
Owner: Council (dual GO)
Location: docs/quality/01-quality-policy-objectives.md
```

### Creation and Approval
1. **Draft**: Author creates/edits document in feature branch
2. **Review**: PR opened → Council A + Council B review (dual GO required)
3. **Approval**: Merge at exact commit hash with all CI gates green
4. **Publication**: Merged to main branch; version bumped; old version archived in git history

### Review and Update
- **Trigger**: Council review cycle, FAILURE-LOG pattern, regulatory change, Andy directive
- **Frequency**: Minimum per release cycle; max 6 months without review
- **Process**: Same as creation (branch → PR → council → merge)
- **Evidence**: Council verdicts in `out/council-*/council-*.md`; commit hash in PR

### Distribution and Access
- **Internal**: All engineers, council, verifier — read access via GitHub repo
- **External**: Andy (owner), certification body (PARKED), auditors — on request
- **Control**: No uncontrolled copies; main branch is single source of truth

### Control of External Documents
| Document | Source | Version Control | Review Trigger |
|----------|--------|-----------------|----------------|
| ISO 9001:2015 | ISO official | Referenced by clause; not versioned here | New edition |
| UK GDPR | legislation.gov.uk | Referenced; DPIAs in readiness/compliance/ | Legislative change |
| Cyber Essentials | NCSC | Checklist in readiness/compliance/ | Scheme update |
| OmniRoute config | Local instance | omniroute/ folder; env via keyring | Model/routing change |

### Document Retention and Disposition
- **Active documents**: Retained indefinitely in git history
- **Obsolete documents**: Marked OBSOLETE in header; retained in git history
- **Records (CAPA, audit, training, release)**: Minimum 3 years or product lifetime
- **FAILURE-LOG**: Permanent (engineering memory)
- **Council verdicts**: Permanent (governance evidence)
- **Andy briefings**: Permanent (append-only)

### Backup and Recovery
- **Primary**: GitHub remote (chapelgate org) — push on every merge
- **Secondary**: Dell local clone (`/home/andy/chapelgate/repos/maintenanceos-website/`)
- **Tertiary**: Jobs droplet copy (`/root/jobs-work/...`)
- **Cold archive**: `/mnt/d/archives/` tar with SHA256 (monthly)
- **Recovery**: `git clone` from any source; no secrets in repo

### Evidence of Document Control in This Repo
| Control | Evidence Path |
|---------|---------------|
| Version history | `git log --oneline docs/quality/` |
| Council approval | `out/council-*/council-*.md` (per PR) |
| CI gate enforcement | `.github/workflows/*.yml` |
| Branch protection | GitHub repo settings → Branches → main |
| FAILURE-LOG linkage | `/root/jobs-work/readiness/FAILURE-LOG.md` entries reference doc IDs |
| ANDY-BRIEFING linkage | `/home/andy/chapelgate/jobs-work-dell/ANDY-BRIEFING.md` append lines |

### Change Control Integration
- **Code changes**: PR → CI → Council → Merge (this procedure)
- **Document changes**: Same process — no exceptions
- **Emergency changes**: Not permitted — all changes go through council; Andy voice order = STEER.md → council review
- **Rollback**: `git revert <merge-commit>` → new PR → council review (even for rollback)

### Records Templates Referenced
- CAPA Log: `docs/quality/10-capa-log-template.md`
- Audit Report: `docs/quality/11-audit-report-template.md`
- Training Record: `docs/quality/12-training-record-template.md`
- Release Record: `docs/quality/13-release-record-template.md`
