# 10-asvs-l1 — OWASP ASVS Level 1 (Security #10)

## Requirement
All Level 1 controls verified

Applies to: All 12
Classification: Law/buyer (public sector)
Source: OWASP ASVS; release-standards-council-20261114/out/STANDARDS.md item 10; factory-tasks/council-compliance-pack-20261115 (accessed 2026-11-20)

## How Chapelgate Meets It in Practice
Evidence gathered from real estate repos and Dell services on disk. No certification claimed; no evidence invented — where no evidence exists, status is GAP.

## EVIDENCE
- **Requirement source**: OWASP ASVS, accessed 2026-11-20
- **Standard item**: release-standards-council-20261114/out/STANDARDS.md item 10 (Security #10)
- **Chapelgate repo**: estate repos under /home/andy/chapelgate/repos/ — all 12 product repos contain relevant code, docs, and CI config
- **Dell service**: /home/andy/chapelgate/dell-services/ — monitoring, backup, and security scripts
- **Script/test**: /home/andy/chapelgate/jobs-work-dell/readiness/semgrep/ — SAST scan results; /home/andy/chapelgate/jobs-work-dell/readiness/cyber-essentials/ — self-assessment artefacts
- **Status**: PARTIAL — practice identified but not fully evidenced per clause; free gap fix needed
- **Per-repo evidence paths**: see repo docs/quality/ and .github/workflows/ per product

## GAPS
- Full evidence per clause not yet assembled across all 12 product repos
- No per-clause repo path/commit evidence wired yet
- CI gates for this standard not yet wired

## OPERATING-RHYTHM
- Recurring check: verify security #10 evidence against estate repos on each release cycle
- Wire to existing Dell timers/jobs via FAILURE-LOG monitoring
- Council A/B review required for GO status; record in out/RESULT.md

## PARKED-ITEMS
- Formal certification/attestation — spend decision, Andy-only
- CI enforcement across all 12 repos — council-reviewed PRs per repo
- Legal/sign-off items (DPIA, privacy notice, cookie consent) — DPO/legal, Andy-only
