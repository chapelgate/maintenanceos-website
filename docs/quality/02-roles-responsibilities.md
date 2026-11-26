# Roles and Responsibilities (ISO 9001:2015 Clause 5.3)

## Product: maintenanceos-website

### Top Management (Andy)
- **Authority**: Sole owner; authorises spend (HB-001..010), legal sign-off, production deployment, DNS, keys/secrets
- **QMS accountability**: Approves quality policy; receives ANDY-BRIEFING.md append-only updates; final release authority
- **Non-delegable**: Live Stripe, production DNS, legal text, launch approval — NEVER touched by engineering loop

### Council (Review & Merge Authority)
- **Council A (free-only model)**: 7 personas — security, backend, QA, release, database, compliance, UX
- **Council B (estate-coding model)**: 7 personas — same disciplines, estate context
- **Roastroom Council**: 7 business-advisor personas — advisory on commercial/business questions
- **Decision rule**: Dual GO required (Council A + Council B) at EXACT commit hash; all mandatory checks green; no self-merge
- **Scope**: Every PR affecting source code, CI workflows, docs/quality/, specs/

### Product Owner (Andy / delegated to council)
- Defines acceptance criteria in acceptance docs, SPECS/
- Prioritises backlog in task tracking
- Accepts/rejects deliverables via council GO/FAIL

### Engineering (dr eggbot / OpenCode agents)
- **Implements**: Code changes, tests, CI gates, documentation
- **Verifies**: Runs full test suite, security scans, PentAGI, Full Shakedown before claiming PASS
- **Evidences**: Captures raw command output, exit codes, dates, commits in `out/`
- **Logs failures**: Every failure → `/root/jobs-work/readiness/FAILURE-LOG.md` (date, build, task, actual vs expected)

### QA / Verification (independent verifier per PR)
- Runs verification-before-completion: no PASS without raw proof
- Executes 10 human-persona journeys + Terry cases + 5 red-team runs (incl. PentAGI, ZAP)
- Signs off `out/VERIFIER-FEEDBACK.md` — REJECT means fix all listed failures before re-review

### Security Officer (embedded in council personas)
- Reviews: OWASP ASI Top 10 (agent-owasp-compliance), threat model, PentAGI/ZAP reports
- Approves: security-and-hardening, github-actions-hardening gates
- Reports: `out/PENTAGI-REPORT.md`, `out/SHANNON-REPORT.md` (staging only)

### Compliance / DPO (Andy-only for sign-off)
- DPIA sign-off (HB item, PARKED)
- Cyber Essentials evidence (checklist in `readiness/compliance/`)
- ICO/legal registration (HB item, PARKED)

### Supplier Manager (OmniRoute / Model Providers)
- **OmniRoute**: Local instance 127.0.0.1:20128 (container `omniroute-local-test`); free models only; no paid keys
- **Model providers**: Via OmniRoute routing/fallback/caching; no direct API keys in repo
- **Control**: `06-supplier-control.md` covers evaluation, monitoring, contingency

### Internal Auditor (Council + foreman)
- **Weekly**: QMS artefact review per OPERATING-RHYTHM.md
- **Per release**: Internal audit procedure per `08-internal-audit.md`
- **Continuous**: FAILURE-LOG monitoring via eggbot/watchdog

### Training Records
- Maintained in `docs/quality/12-training-record-template.md`
- Covers: ISO 9001 awareness, secure coding, CI gate operation, council review process
- Evidence: Completion recorded per engineer per release cycle

### Communication Matrix
| Role | Receives | Sends | Channel |
|------|----------|-------|---------|
| Andy | ANDY-BRIEFING.md (append), PROGRESS.md, RESULT.md | Voice orders, HB decisions | Direct |
| Council A/B | PR diff, evidence pack | GO/FAIL verdict in `out/council-*/council-*.md` | OmniRoute |
| Roastroom | PR diff, council verdicts | ROASTROOM-VERDICT.md | `/root/jobs-work/councils/roastroom/run.sh` |
| Engineering | STEER.md, council verdicts | Code, tests, evidence | Git/PR |
| Verifier | PR at exact head | VERIFIER-FEEDBACK.md | `out/` |
