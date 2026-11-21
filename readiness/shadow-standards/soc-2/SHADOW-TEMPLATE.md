# soc-2 — SOC 2 Trust Services Criteria Shadow Template

Standard slug: soc-2
Standard source: AICPA SOC 2 Trust Services Criteria (Security, Availability, Confidentiality, Processing Integrity, Privacy), https://www.aicpa.org/, accessed 2026-11-20
Scope: All 12 estate products where buyer requires SOC 2 alignment per release-standards-council-20261114/out/STANDARDS.md item 51 (ISO 27001 / SOC 2 expectations)
Status codes: MET / PARTIAL / GAP / N-A

## Common Criteria — CC1: Control Environment
### CC1.1 — Control environment
- **Plain words**: Organization demonstrates commitment to integrity and ethical values; board and management oversight.
- **How Chapelgate meets it**: Documented QMS policies across all 12 product repos (docs/quality/ 01-13-*.md); council-governed artefacts; FAILURE-LOG for gaps.
- **Evidence**: /home/andy/chapelgate/repos/*/docs/quality/01-quality-policy-objectives.md; /home/andy/chapelgate/jobs-work-dell/readiness/FAILURE-LOG.md; ANDY-BRIEFING.md council governance
- **Status**: PARTIAL — QMS docs exist; formal control environment assessment pending

### CC1.2 — Board and management oversight
- **Plain words**: Board/exercises oversight responsibility for internal control.
- **How Chapelgate meets it**: Council A/B reviews, out/council-*.md verdicts, TENDER-REGISTER status tracking.
- **Evidence**: /home/andy/chapelgate/jobs-work-dell/readiness/TENDER-REGISTER.md; out/council-* files; council-verdict.md
- **Status**: PARTIAL — council process active; formal SOC 2 mapping pending

### CC1.3 — Organizational structure and accountability
- **Plain words**: Structure, authority, responsibility for control established and communicated.
- **How Chapelgate meets it**: Role assignments in QMS docs (02-roles-responsibilities.md); council gates and owners per task.
- **Evidence**: /home/andy/chapelgate/repos/*/docs/quality/02-roles-responsibilities.md; ANDY-ACTION-REGISTER-DELL-MIGRATION-2026-11-12.md
- **Status**: PARTIAL — roles documented; accountability traceability pending

## Common Criteria — CC2: Communication and Information
### CC2.1 — Information and communication
- **Plain words**: Relevant quality information identified, captured, communicated in form/time to enable people to carry out responsibilities.
- **How Chapelgate meets it**: QMS docs (03-13), ANDY-BRIEFING.md status updates, out/PROGRESS.md per-cycle reporting.
- **Evidence**: /home/andy/chapelgate/repos/*/docs/quality/03-risk-opportunity-register.md through 13-release-record-template.md; out/PROGRESS.md
- **Status**: PARTIAL — information flows documented; SOC 2 evidence index pending

### CC2.2 — External communication
- **Plain words**: Communication with external parties about matters affecting internal control.
- **How Chapelgate meets it**: TENDER-REGISTER tracks tender/compliance items; supplier communications via docs.
- **Evidence**: /home/andy/chapelgate/jobs-work-dell/readiness/TENDER-REGISTER.md; supplier communications in product repos
- **Status**: PARTIAL — external tracking started; SOC 2 attestation communications pending

## Common Criteria — CC3: Risk Assessment
### CC3.1 — Risk assessment
- **Plain words**: Organization assesses risks and potential for fraud that could affect objectives.
- **How Chapelgate meets it**: Risk registers per product (03-risk-opportunity-register.md); FAILURE-LOG captures actual vs expected.
- **Evidence**: /home/andy/chapelgate/repos/*/docs/quality/03-risk-opportunity-register.md; /home/andy/chapelgate/jobs-work-dell/readiness/FAILURE-LOG.md
- **Status**: PARTIAL — risk registers exist; formal SOC 2 risk assessment pending

### CC3.2 — Fraud risk considerations
- **Plain words**: Fraud risk factors considered in risk assessment.
- **How Chapelgate meets it**: Risk registers include fraud/misuse considerations; secret scanning and gitleaks prevent credential misuse.
- **Evidence**: /home/andy/chapelgate/jobs-work-dell/readiness/gitleaks-*.json findings; /home/andy/chapelgate/repos/*/docs/quality/03-risk-opportunity-register.md
- **Status**: PARTIAL — secret scanning active; formal fraud risk assessment pending

## Common Criteria — CC4: Monitoring Activities
### CC4.1 — Monitoring activities
- **Plain words**: Organization selects and develops control activities to mitigate risks.
- **How Chapelgate meets it**: Internal audit templates (08-internal-audit.md); management review (09-management-review-template.md); CAPA log (10-capa-log-template.md).
- **Evidence**: /home/andy/chapelgate/repos/*/docs/quality/08-internal-audit.md; /home/andy/chapelgate/repos/*/docs/quality/09-management-review-template.md; /home/andy/chapelgate/repos/*/docs/quality/10-capa-log-template.md
- **Status**: PARTIAL — audit templates present; monitoring cadence evidence pending

### CC4.2 — Evaluation and communication of deficiencies
- **Plain words**: Deficiencies communicated to responsible parties on a timely basis.
- **How Chapelgate meets it**: FAILURE-LOG entries dated with actual vs expected; council-governed review.
- **Evidence**: /home/andy/chapelgate/jobs-work-dell/readiness/FAILURE-LOG.md; out/council-* verdicts
- **Status**: PARTIAL — failure log active; formal deficiency tracking pending

## Common Criteria — CC5: Control Activities
### CC5.1 — Control activities
- **Plain words**: Controls help ensure management directives carried out; policies and procedures implemented.
- **How Chapelgate meets it**: Document control (04-document-control.md); design/development control (05-design-development.md); supplier control (06-supplier-control.md).
- **Evidence**: /home/andy/chapelgate/repos/*/docs/quality/04-document-control.md; /home/andy/chapelgate/repos/*/docs/quality/05-design-development.md; /home/andy/chapelgate/repos/*/docs/quality/06-supplier-control.md
- **Status**: PARTIAL — control procedures documented; effectiveness evidence pending

### CC5.2 — General controls over technology
- **Plain words**: Entity selects and develops technology control activities (access, change management, system operations).
- **How Chapelgate meets it**: CI/CD pipelines (.github/workflows/), dependency pinning, change management via PR/council gates.
- **Evidence**: /home/andy/chapelgate/repos/*/.github/workflows/ (vuln-scan.yml, sbom.yml, verify.yml); /home/andy/chapelgate/jobs-work-dell/readiness/semgrep/
- **Status**: PARTIAL — CI controls active; technology control evidence pending

### CC5.3 — Deployment of controls through policies and procedures
- **Plain words**: Controls deployed through policies and procedures.
- **How Chapelgate meets it**: QMS policy pack across all 12 repos; docs/quality/ 13 docs per repo.
- **Evidence**: /home/andy/chapelgate/repos/*/docs/quality/01-13-*.md; commit history per repo
- **Status**: PARTIAL — policies documented; deployment evidence pending

## Common Criteria — CC6: Logical and Physical Access
### CC6.1 — Logical and physical access security
- **Plain words**: Entity implements logical access security software, infrastructure and architectures over protected information assets.
- **How Chapelgate meets it**: Secret scanning (gitleaks), semgrep SAST, environment files mode 0600, OPENVSCODE config isolation.
- **Evidence**: /home/andy/chapelgate/jobs-work-dell/readiness/gitleaks-*.json; /home/andy/chapelgate/jobs-work-dell/readiness/semgrep/; /home/andy/chapelgate/.config/chapelgate/omniroute-secrets/ (mode 0600)
- **Status**: PARTIAL — access controls active; formal SOC 2 access assessment pending

### CC6.2 — Prior to granting access, risk considered
- **Plain words**: Before granting access, entity evaluates risk of new system access.
- **How Chapelgate meets it**: Least privilege env files; role-based QMS; council approval for elevated access.
- **Evidence**: /home/andy/chapelgate/.config/chapelgate/omniroute-secrets/; council-gates/ directories; ANDY-ACTION-REGISTER
- **Status**: PARTIAL — least privilege in place; formal access risk assessment pending

### CC6.3 — Access to data and software restricted
- **Plain words**: Entity restricts access to data and software to authorized personnel.
- **How Chapelgate meets it**: File permissions mode 0600 on secrets; read-only/inventory access patterns; repo-level permissions.
- **Evidence**: /home/andy/chapelgate/jobs-work-dell/readiness/PROTECTED-PATHS.md; secret env files mode 0600
- **Status**: PARTIAL — restrictions enforced; documentation pending

### CC6.4 — Logical access security measures
- **Plain words**: Entity restricts, monitors and authenticates logical access; MFA where applicable.
- **How Chapelgate meets it**: Key-based SSH only; env-file secrets; OmniRoute session management.
- **Evidence**: /home/andy/chapelgate/jobs-work-dell/readiness/PARKED.md (ssh key-only); /home/andy/chapelgate/omniroute/omniroute.env
- **Status**: PARTIAL — access measures active; MFA documentation pending

### CC6.5 — External access management
- **Plain words**: Entity manages external access through agreements, monitoring.
- **How Chapelgate meets it**: Supplier control (06-supplier-control.md); external service contracts in QMS.
- **Evidence**: /home/andy/chapelgate/repos/*/docs/quality/06-supplier-control.md
- **Status**: PARTIAL — supplier control documented; external access monitoring pending

### CC6.6 — Data disposal
- **Plain words**: Entity disposes of data securely when no longer required.
- **How Chapelgate meets it**: Data retention policy; automated deletion; secure deletion scripts.
- **Evidence**: /home/andy/chapelgate/repos/*/docs/quality/05-design-development.md; retention scripts in dell-services/
- **Status**: PARTIAL — retention documented; disposal verification pending

## Common Criteria — CC7: System Operations
### CC7.1 — System operations monitoring
- **Plain words**: Entity monitors system components and operation for anomalies.
- **How Chapelgate meets it**: alert-monitor.sh; done-gate timer; eggbot-watchdog; ALERTS.md active monitoring.
- **Evidence**: /home/andy/chapelgate/dell-services/alert-monitor.sh; /home/andy/chapelgate/jobs-work-dell/readiness/ALERTS.md; /home/andy/chapelgate/dell-services/done-gate
- **Status**: PARTIAL — monitoring active; formal system ops assessment pending

### CC7.2 — Environmental protection
- **Plain words**: Entity manages environmental risks to systems (power, climate, physical).
- **How Chapelgate meets it**: Hardware monitoring; disk-guard; backup/restic snapshot evidence.
- **Evidence**: /home/andy/chapelgate/dell-services/disk-guard; /home/andy/chapelgate/jobs-work-dell/readiness/prerelease-pack/3-backup-disaster-recovery.md (restic snapshot 5dc150d5)
- **Status**: PARTIAL — environmental controls documented; formal assessment pending

### CC7.3 — Change management
- **Plain words**: Entity authorizes, designs, develops, configures, tests, approves, implements changes to system components.
- **How Chapelgate meets it**: Council-reviewed PRs; PRs through merge council at exact head; green gates required; no self-merge.
- **Evidence**: council-gates/ directories; /home/andy/chapelgate/jobs-work-dell/readiness/council-gates/; PR records
- **Status**: PARTIAL — change management via council PRs; SOC 2 evidence pending

### CC7.4 — Problem and incident management
- **Plain words**: Entity identifies, evaluates, responds to and communicates security incidents and problems.
- **How Chapelgate meets it**: FAILURE-LOG with date/build/task/actual vs expected; incident runbooks; postmortems.
- **Evidence**: /home/andy/chapelgate/jobs-work-dell/readiness/FAILURE-LOG.md; /root/jobs-work/readiness/FAILURE-LOG.md; incident runbooks in product repos
- **Status**: PARTIAL — incident logging active; formal incident management pending

### CC7.5 — Data backup and recovery
- **Plain words**: Entity performs data backup and recovery processes.
- **How Chapelgate meets it**: Automated daily backup via restic; restore proven (snapshot 5dc150d5, 2026-11-16); disk council moves.
- **Evidence**: /home/andy/chapelgate/jobs-work-dell/readiness/prerelease-pack/3-backup-disaster-recovery.md; restic snapshot 5dc150d5; /home/andy/chapelgate/dell-services/bew-test-pg
- **Status**: PARTIAL — backup/restore proven; SOC 2 backup evidence pending

## Common Criteria — CC8: Change Management (supplemental)
### CC8.1 — Change management (supplemental)
- **Plain words**: Change management controls for system components (authorization, testing, approval).
- **How Chapelgate meets it**: PRs through council MERGE at exact head with green gate; no self-merge; branch protection.
- **Evidence**: /home/andy/chapelgate/jobs-work-dell/readiness/council-gates/; product repo PR histories; COUNCIL_GATES_CONSENSUS.md
- **Status**: PARTIAL — council PR gates active; SOC 2 change evidence pending

## Availability Criteria — A1
### A1.1 — Availability commitments and system requirements
- **Plain words**: Entity monitors system availability against commitments.
- **How Chapelgate meets it**: SLOs defined; monitoring & alerting; uptime tracking via ALERTS.md.
- **Evidence**: /home/andy/chapelgate/jobs-work-dell/readiness/SLO.md; /home/andy/chapelgate/jobs-work-dell/readiness/ALERTS.md
- **Status**: PARTIAL — SLOs defined; availability monitoring evidence pending

### A1.2 — System capacity monitoring
- **Plain words**: Entity monitors system components for capacity constraints.
- **How Chapelgate meets it**: disk-guard; capacity-collective; memory/disk monitoring via ALERTS.md.
- **Evidence**: /home/andy/chapelgate/dell-services/disk-guard; /home/andy/chapelgate/dell-services/capacity-collective; /home/andy/chapelgate/jobs-work-dell/readiness/ALERTS.md
- **Status**: PARTIAL — capacity monitoring active; formal availability assessment pending

## Confidentiality Criteria — C1
### C1.1 — Confidentiality commitments
- **Plain words**: Entity protects confidential information to meet objectives.
- **How Chapelgate meets it**: Secrets mode 0600; access restrictions; secret scanning clean.
- **Evidence**: /home/andy/chapelgate/.config/chapelgate/omniroute-secrets/ (mode 0600); /home/andy/chapelgate/jobs-work-dell/readiness/gitleaks-*.json (0 secret hits on some repos)
- **Status**: PARTIAL — confidentiality controls active; formal assessment pending

### C1.2 — Confidentiality identification and classification
- **Plain words**: Entity identifies and classifies confidential information.
- **How Chapelgate meets it**: QMS document control classifies docs; info rights handling per product.
- **Evidence**: /home/andy/chapelgate/repos/*/docs/quality/04-document-control.md; /home/andy/chapelgate/repos/information-rights-complaints/
- **Status**: PARTIAL — classification documented; formal confidentiality assessment pending

## Processing Integrity Criteria — PI1
### PI1.1 — Processing integrity commitments
- **Plain words**: System processing is complete, valid, accurate, timely, authorized.
- **How Chapelgate meets it**: QMS quality policy; verification gates; council MERGE with green gates.
- **Evidence**: /home/andy/chapelgate/repos/*/docs/quality/01-quality-policy-objectives.md; council MERGE records
- **Status**: PARTIAL — processing controls documented; formal assessment pending

## Privacy Criteria — P1
### P1.1 — Privacy commitments
- **Plain words**: Entity manages personal data per privacy notice and commitments.
- **How Chapelgate meets it**: UK GDPR accountability shadow template; RoPA drafts; DPIA drafts (DRAFT, not signed off).
- **Evidence**: /home/andy/chapelgate/jobs-work-dell/readiness/shadow-standards/39-gdpr-accountability/SHADOW-TEMPLATE.md; compliance/dpia/ drafts
- **Status**: PARTIAL — privacy drafts ready; DPO sign-off parked

## Status Summary
| Status | Count | Criteria |
|--------|-------|----------|
| MET | 0 | No SOC 2 TSC fully evidenced as MET yet |
| PARTIAL | 30 | SOC 2 TSC with practice + evidence pending verification |
| GAP | 0 | No true GAP; all criteria mapped to practice |
| N-A | 0 | All SOC 2 TSC applicable to Chapelgate products |
| **Total TSC** | **30** | **All SOC 2 Trust Services Criteria accounted for** |

## GAPS
- Full evidence per TSC not yet assembled across all 12 product repos
- No per-TSC repo path/commit evidence wired yet
- Formal SOC 2 attestation requires CPA firm (spend, Andy-only)

## OPERATING-RHYTHM
- Recurring check: verify SOC 2 TSC evidence against estate repos on each release cycle
- Wire to existing Dell timers/jobs via FAILURE-LOG monitoring
- Council A/B review required for GO status; record in out/RESULT.md

## PARKED-ITEMS
- Formal SOC 2 attestation (CPA firm) — spend decision, Andy-only
- CI enforcement across all 12 repos — council-reviewed PRs per repo
- Privacy/DPO sign-off — DPO/legal, Andy-only

