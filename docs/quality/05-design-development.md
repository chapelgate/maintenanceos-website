# Design and Development Procedure (ISO 9001:2015 Clause 8.3)

## Product: maintenanceos-website

### Overview
This procedure governs the design and development of maintenanceos-website, tied to the repository's real CI/CD pipeline, PR review process, and release flow. All development follows the council-governed merge rules.

---

## 8.3.1 General
Design and development is planned and controlled through:
- **Council-governed PRs**: Every change requires dual-council GO at exact commit hash
- **CI gates**: Mandatory checks must pass (workflows: do-readonly-inventory.yml estate-gate.yml factory-test-001.lock.yml factory-test-001.md lighthouse.yml opencode.yml pages.yml promptfoo.yml webkit-a11y.yml website-integration-repair-validation.yml )
- **Evidence collection**: Raw command output, exit codes, dates, commits captured in `out/`
- **Verification-before-completion**: No PASS without independent verifier sign-off

### Design and Development Planning (Clause 8.3.2)

#### Inputs (Clause 8.3.3)
| Input | Source | Evidence Path |
|-------|--------|---------------|
| Quality policy & objectives | `docs/quality/01-quality-policy-objectives.md` | This repo |
| Risk & opportunity register | `docs/quality/03-risk-opportunity-register.md` | This repo |
| Requirements (functional, regulatory, security) | Acceptance docs, SPECS/, readiness/compliance/ | This repo |
| Council verdicts (prior decisions) | `out/council-*/council-*.md` | This repo |
| FAILURE-LOG lessons learned | `/root/jobs-work/readiness/FAILURE-LOG.md` | Dell estate |
| Supplier capabilities (OmniRoute, models) | Readiness docs | This repo |

#### Controls (Clause 8.3.4)
| Control | Implementation | Evidence |
|---------|----------------|----------|
| Design reviews | Council A + Council B debate/rebuttal/vote rounds | `out/council-*/council-*.md` |
| Verification | Independent verifier: 10 journeys + Terry + 5 red-team | `out/VERIFIER-FEEDBACK.md` |
| Validation | PentAGI + ZAP + Full Shakedown on staging | `out/PENTAGI-REPORT.md`, `out/SHANNON-REPORT.md` |
| CI gate enforcement | `.github/workflows/*.yml` block merge on failure | Branch protection rules |
| Blast radius analysis | blast-radius skill before any merge | `out/BLAST-RADIUS.md` |

#### Outputs (Clause 8.3.5)
| Output | Location | Verification |
|--------|----------|--------------|
| Design specifications | specs/, docs/quality/ | Council review |
| Source code | Repository source dirs | CI tests + verifier |
| Test cases | tests/, scripts/ | Coverage ≥90% |
| CI/CD pipelines | .github/workflows/*.yml | Green on PR |
| Release artefacts | dist/, Docker images | Release workflow |
| Evidence packages | out/, artifacts/ | Verifier sign-off |

---

## Real CI/CD Pipeline (This Repo)

### Workflows: do-readonly-inventory.yml estate-gate.yml factory-test-001.lock.yml factory-test-001.md lighthouse.yml opencode.yml pages.yml promptfoo.yml webkit-a11y.yml website-integration-repair-validation.yml 

Each workflow triggers on PR to main, runs tests/lints/scans, and is required for merge via branch protection.

**Evidence**: Run logs in GitHub Actions; captured by foreman in `out/`

---

## PR Review and Merge Flow (Clause 8.3.4, 8.5.1)

### Step 1: Branch Creation
- Engineer creates branch: `feat/<issue-id>-<short-desc>` or `fix/<issue-id>-<short-desc>`
- Branch from main at current HEAD

### Step 2: Implementation
- Code changes + tests + documentation updates
- Local verification: test, lint, typecheck commands
- Capture evidence in `out/` (auto or manual)

### Step 3: PR Creation
- PR title: `[<type>] <description>` (feat, fix, docs, refactor, security)
- PR description: Links to issue, acceptance criteria, test plan
- Labels: needs-council-review, release-candidate (if applicable)

### Step 4: CI Execution (Automatic)
- All workflows trigger on PR
- Status checks reported to PR
- **No merge until ALL green**

### Step 5: Council Review (Mandatory)
- **Council A**: Runs council-a-review.sh via OmniRoute (free-only model)
- **Council B**: Runs council-b-review.sh via OmniRoute (estate-coding model)
- **Roastroom**: Runs /root/jobs-work/councils/roastroom/run.sh (advisory)
- Each produces verdict: GO / FAIL / ABSTAIN with rationale
- **Dual GO required** — single FAIL blocks merge

### Step 6: Verifier Review (Mandatory)
- Independent verifier assigned (not the author)
- Runs: 10 human-persona journeys + Terry cases + 5 red-team (PentAGI, ZAP, Shannon on staging)
- Produces `out/VERIFIER-FEEDBACK.md`: PASS or REJECT with failure list
- **REJECT = fix all failures → re-run verifier**

### Step 7: Merge (Council-Only)
- Council merges via authorised path (GH CLI or UI with council account)
- **No self-merge** — author cannot merge own PR
- Merge at EXACT commit hash reviewed (no new commits after verdict)
- Squash merge with conventional commit message

### Step 8: Post-Merge Verification
- Re-run CI on merged commit (auto via push to main)
- Verifier re-tests merged commit
- Update `out/PROGRESS.md`, ANDY-BRIEFING.md (append line)
- Tag release if release-candidate label: v<semver>

---

## Design Changes (Clause 8.3.6)
- **Trigger**: New requirement, FAILURE-LOG pattern, security finding, Andy directive
- **Process**: Same as new development (branch → PR → council → verifier → merge)
- **Impact analysis**: blast-radius skill run before council review
- **Documentation**: Updated specs, risk register, test cases in same PR

---

## Release Flow (Clause 8.5.1, 8.6)

### Release Candidate
1. PR with release-candidate label
2. Release gate workflow runs full validation
3. Council review + verifier sign-off
4. Merge to main

### Release Publication
1. GitHub Actions creates GitHub Release
2. Attaches: SBOM, test reports, vulnerability scan, PentAGI report
3. Docker image built and tagged (if applicable)
4. `out/RELEASE-RECORD-<version>.md` created (template: docs/quality/13-release-record-template.md)

### Release Record Evidence
- Commit hash, tag, date
- Council verdict links
- Verifier sign-off
- CI gate results (all green)
- PentAGI/ZAP/Shannon reports (staging)
- SBOM hash
- Known issues (from FAILURE-LOG)

---

## Evidence Links for This Procedure
| Element | Evidence Path |
|---------|---------------|
| CI workflows | .github/workflows/*.yml |
| Council review scripts | council-a-review.sh, council-b-review.sh |
| Roastroom script | /root/jobs-work/councils/roastroom/run.sh |
| Verification skill | verification-before-completion |
| Blast radius skill | blast-radius |
| PentAGI skill | pentagi-security-testing |
| FAILURE-LOG | /root/jobs-work/readiness/FAILURE-LOG.md |
| ANDY-BRIEFING | /home/andy/chapelgate/jobs-work-dell/ANDY-BRIEFING.md |
| PROGRESS | out/PROGRESS.md |
