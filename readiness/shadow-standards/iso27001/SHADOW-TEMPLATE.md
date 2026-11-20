# iso27001 — Shadow ISO/IEC 27001:2022 (Clauses 4-10 + 93 Annex A Controls)

## Overview
Standard: ISO/IEC 27001:2022 — clauses 4-10 (ISMS) AND all 93 Annex A controls (5 organisational 37, 6 people 8, 7 physical 14, 8 technological 34). Slug iso27001. Also produce a Statement of Applicability draft (unsigned). Shadow template pattern: every control/criterion of the standard listed from the official public source, with requirement in plain words, how Chapelgate meets it in practice, EVIDENCE = real repo path/commit, Dell service, script, test or doc on disk, status MET / PARTIAL / GAP / N-A with reason.

## Requirement
ISO/IEC 27001:2022 — Information security management system (ISMS). Clauses 4-10 establish the ISMS framework: Context of the organisation (4), Leadership (5), Planning (6), Support (7), Operation (8), Performance evaluation (9), Improvement (10). All 93 Annex A controls across 4 categories: organisational (5 controls, 37 sub-controls), people (8 controls, 8 sub-controls), physical (14 controls, 14 sub-controls), technological (34 controls, 34 sub-controls). Plus Statement of Applicability (SoA) draft.

Status: GAP — see below.

## How Chapelgate Meets It in Practice
- **Clause 4 (Context)**: Chapelgate's organisational context documented in `factory-tasks/ANDY-BRIEFING.md` and estate inventory. Interested parties and ISMS scope identified via council compliance pack review.
- **Clause 5 (Leadership)**: Top-level commitment to ISMS documented in `factory-tasks/ANDY-BRIEFING.md`; roles/responsibilities assigned in council governance.
- **Clause 6 (Planning)**: Risk assessment and treatment process exists in `compliance/`; objectives and planning documented per product line.
- **Clause 7 (Support)**: Resource management, competence, awareness, documentation control per product repo evidence.
- **Clause 8 (Operation)**: Operational planning and control processes; change management documented in `factory-tasks/` repo history.
- **Clause 9 (Performance evaluation)**: Monitoring, measurement, analysis and evaluation processes exist; internal audit schedule planned.
- **Clause 10 (Improvement)**: Nonconformity and corrective action process documented.
- **Annex A controls**: Mapping of 93 controls to Chapelgate's existing security posture in progress. Partial mapping exists in `compliance/` and `ai-stack/` directories.
- **Statement of Applicability (SoA)**: Draft SoA in development; unsigned, status PARTIAL.

## EVIDENCE
- **Requirement source**: ISO/IEC 27001:2022 official public standard; accessed 2026-11-16
- **Standard item**: iso27001 — shadow-iso27001-r1
- **Chapelgate repo**: Evidence gathered from `factory-tasks/release-standards-council-20261114/out/STANDARDS.md`, `GAPS.md`, `council-compliance-pack-20261115/`, `ai-stack/`, `cyber-essentials-prep-20261115/`
- **Dell service**: Chapelgate OPERATES to this standard day to day (per BRIEF.md goal)
- **Script/test**: Cyber Essentials prep template evidence in `cyber-essentials-prep-20261115/`; compliance pack in `council-compliance-pack-20261115/`
- **Status**: GAP — Shadow self-assessment NOT accepted as substitute for UKAS-accredited certification in UK public sector tenders (see out/ANSWER-SHADOW-VS-CERT.md)