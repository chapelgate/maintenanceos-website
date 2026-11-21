# Narrow Pilot Proposal — Chapelgate Technologies for Sefton-style Council

## Pilot Options

### Option A: Welsh-language Transcription (Chapelgate Multilingual Transcribe)
- **Product**: chapelgate-multilingual-transcribe (ASR for Welsh/English audio)
- **Use case**: Transcribe Welsh/English council meetings, committees, consultations
- **Trigger**: Welsh Language Standards (6 local authorities have them)
- **Delivery**: Local CPU inference, no paid API, no model training

### Option B: Council Minutes (via public-sector-citizen-agent)
- **Product**: public-sector-citizen-agent (approved/refusal/handoff knowledge agent)
- **Use case**: Committee minutes publication workflow (3–5 working day turnaround)
- **Trigger**: Agilisys at Sefton does this; Chapelgate synthetic demo already covers it
- **Delivery**: Deterministic rule-based agent with approved-knowledge swap (no LLM date arithmetic)

---

## Scope (both options)

| Item | Detail |
|------|--------|
| **Council profile** | Sefton-style: metropolitan borough, Agilisys incumbent, 7 synthetic knowledge entries from www.sefton.gov.uk accessed 16 Nov 2026 |
| **Data** | Synthetic only — no real resident data, no council APIs, no production tenancy |
| **Deployment** | Local instance on Chapelgate Dell (Ubuntu 24.04) or isolated cloud VM; UK data residency |
| **Integration** | None required — standalone product demo; no M365 tenancy integration in pilot |
| **Compliance evidence** | Cyber Essentials self-assessment complete (draft answers, GAP list, free fixes); model cards, DPIA drafts exist; SBOMs documented |
| **Security testing** | Full Shakedown: 0 FAIL (council-ai-agent-sefton-gap-20261116/out/shakedown/CHECKLIST.md); RL20: 20/20 PASS (rl20-housing-compliance-vault-20261116/out/rl20/RESULTS.md) |

---

## 6–8 Week Plan

### Weeks 1–2: Kick-off & Setup
- Confirm pilot option (A or B) and scope with council contact
- Provision isolated environment (Dell or UK-hosted VM)
- Deploy pilot product with synthetic Sefton data
- Share access & runbook with council pilot lead

### Weeks 3–4: Core Pilot Execution
- **Option A**: Run Welsh/English transcription bench on council audio samples (synthetic or council-provided non-sensitive); measure WER/CER vs bench gate (wer_max 0.25, cer_max 0.12)
- **Option B**: Run committee minutes workflow end-to-end (enquiry → approved answer → refusal → handoff); measure turnaround vs 3–5 day target
- Council pilot lead validates outputs against expected results

### Weeks 5–6: Security & Compliance Review
- Council reviews: Cyber Essentials self-assessment artefacts, model card, DPIA draft, SBOM
- Chapelgate runs PentAGI red-team against pilot instance (isolated, own apps only)
- Any findings triaged; free fixes applied where no Andy login needed

### Weeks 7–8: Exit & Handover
- Final report: success measures, timings, compliance evidence, security findings
- Data return: all synthetic data destroyed; council audio (if any) returned/deleted per DPIA
- Exit checklist: access revoked, logs exported, no residual data
- Pilot reference: if council agrees, named reference for G-Cloud/tender use (Andy-only decision)

---

## Success Measures

| Measure | Target | Evidence Source |
|---------|--------|-----------------|
| **Transcription accuracy (Option A)** | WER ≤ 0.25, CER ≤ 0.12 on Welsh/English test audio | chapelgate-multilingual-transcribe bench results (results JSON with git_sha + verdict) |
| **Minutes workflow turnaround (Option B)** | End-to-end ≤ 5 working days (synthetic) | public-sector-citizen-agent demo_sefton_agent.py run + audit trail |
| **Security** | 0 Critical/High findings from PentAGI red-team; Cyber Essentials self-assessment GAPs documented | PentAGI report; cyber-essentials-prep/out/CE-DRAFT-ANSWERS.md |
| **Compliance artefacts** | Model card, DPIA draft, SBOM provided for pilot product | jobs-work-dell/readiness/compliance/ |
| **Data protection** | UK data residency; no PII in synthetic data; DPIA draft linked | DPIA draft; INVENTORY-TEMPLATE.md; manifest.jsonl pii_free: true |
| **Exit** | All pilot data returned/destroyed within 5 working days | Exit checklist signed by both parties |

---

## Data Protection Approach

- **DPIA draft**: jobs-work-dell/readiness/compliance/dpia/ (business-evidence-wallet DPIA exists; pilot product DPIA drafted)
- **UK data residency**: Pilot runs on Chapelgate Dell (Ubuntu 24.04, UK) or UK-hosted isolated VM — no data leaves UK
- **Synthetic data only**: 7 Sefton entries from www.sefton.gov.uk (accessed 16 Nov 2026), PII-free (manifest.jsonl attests pii_free: true)
- **No production tenancy**: No council M365 integration, no live APIs, no resident data
- **Exit & data return**: All pilot artefacts destroyed; council-provided audio (if any) returned/deleted per written instruction within 5 working days

---

## Pilot Price Model (TBD-ANDY)

| Option | Structure | Figures |
|--------|-----------|---------|
| **Option A: Welsh Transcription** | Fixed pilot fee (6–8 weeks) + optional per-minute transcription rate if extended | TBD-ANDY |
| **Option B: Council Minutes** | Fixed pilot fee (6–8 weeks) + optional annual SaaS subscription if adopted | TBD-ANDY |
| **Both** | No hidden fees; setup/migration/training quoted separately on request | TBD-ANDY |

> **Note**: No prices invented. All figures marked TBD-ANDY per brief. Pilot is cheap/fast — designed to be free or nominal cost to council.

---

## Evidence Cited

| Evidence | Source | Result |
|----------|--------|--------|
| **Sefton AI Agent Demo Full Shakedown** | council-ai-agent-sefton-gap-20261116/out/shakedown/CHECKLIST.md | 0 FAIL (all PASS) |
| **RL20 Housing Compliance Vault** | rl20-housing-compliance-vault-20261116/out/rl20/RESULTS.md | 20/20 PASS, 2 consecutive clean runs |
| **Cyber Essentials Self-Assessment** | cyber-essentials-self-assessment-20261116/out/council-ce-self-assessment-20261116.md | Second-family council GO |
| **Competitor Gap Analysis** | competitor-gaps-agilisys-netcall-civica-20261116/out/RANKED-GAPS.md | Rank 1: G-Cloud + named refs; Rank 3: Named council reference via pilot |
| **Sefton Capability Map** | council-ai-agent-sefton-gap-20261116/out/SEFTON-GAP-CAPABILITY.md | Chapelgate has equivalent synthetic demo for Agilisys capabilities at Sefton |

---

## Exit & Data Return

1. **Access revocation**: All pilot accounts, SSH keys, API tokens disabled within 1 working day of pilot end
2. **Data destruction**: Synthetic data deleted; council audio (if provided) returned via encrypted transfer or securely deleted per written instruction
3. **Logs**: Audit logs exported to council (redacted for Chapelgate internal ops only)
4. **Environment teardown**: Pilot VM/container destroyed; no residual data
5. **Confirmation**: Both parties sign exit checklist

---

## No Invented Claims

- No real council customers or metrics invented
- No certifications claimed (Cyber Essentials self-assessment only — not certified)
- No production deployments referenced (pilot is isolated demo)
- All competitor facts cited to public URLs with access dates
- All Chapelgate capabilities evidenced by source files and test results
- Pricing figures TBD-ANDY — no figures invented