# Service Definition — public-sector-citizen-agent

## Product
public-sector-citizen-agent — Procurement-led UK council and public-sector citizen contact agent.

## Lot
Cloud Software (SaaS)

## Description
Citizen contact agent for UK councils and public sector. Resident page (GET /) answers only from approved information or refuses; refusal or request for a person can leave a handoff record. Approved knowledge base with PILOT SAMPLE entries. No AI/ML model dependency in product runtime.

## Key features
- Resident-facing page answers only from approved knowledge or refuses
- Handoff form on refusal or explicit request for a person
- Approved knowledge base (config/approved_knowledge.json) with PILOT SAMPLE entries
- No model-driven answer generation
- Tests: CSRF, ingress security, enquiry validation, support evidence, stop words, boundary codes
- Real-life E2E: 59/59 pass; red team: 88/88 pass at SHA 897cec32

## Intended users
UK councils and public sector bodies needing citizen contact agent.

## Data handled
Approved knowledge entries (pilot sample), resident enquiry text, handoff records. Synthetic data only; no live resident data.

## AI/ML use
None. Explicitly blocks NVIDIA free API (integrate.api.nvidia.com, nvapi) in product paths. No AI/ML model dependency.

## Security & compliance
- SBOM: public-sector-citizen-agent — 10 components, 0 critical, 0 high, 0 medium (PASS)
- Model card: compliance/model-cards/public-sector-citizen-agent.md
- Cyber Essentials self-check: PARTIAL (not certified)
- Tests: 59/59 real-life E2E pass, 88/88 red team pass

## Evidence paths
- Source: /home/andy/chapelgate/repos/public-sector-citizen-agent/
- Model card: jobs-work-dell/readiness/compliance/model-cards/public-sector-citizen-agent.md
- SBOM: jobs-work-dell/readiness/sbom/public-sector-citizen-agent/

## Known gaps
- Voice out of this release (including MaintenanceOS voice wrapper)
- Approved knowledge is PILOT SAMPLE ONLY — must be replaced with buyer-approved info before any live pilot
- No live production deployment
- Cyber Essentials certification not yet obtained

## Version
slice2-recheck snapshot (commit 2501cd5de328f46c1b9ee926163dfa97c60befc8)