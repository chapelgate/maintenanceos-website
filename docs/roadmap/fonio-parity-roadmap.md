# Fonio parity roadmap

**Benchmark:** Fonio public product (fonio.ai). Fonio is the **minimum** bar, not the ceiling.  
**Constraint:** frozen live telephony until controlled-call gates pass.

## Phase 0 — Foundations (this PR / docs)

- [x] Competitive parity matrix
- [x] Architecture + onboarding + threat model + test plans (docs)
- [x] Claims-safe `/create` marketing funnel (preview / waitlist OK)
- [ ] SCM access for Cursor cloud agents on private website repo

## Phase 1 — Website → sandbox receptionist (P0)

- [x] SSRF-safe website ingestion module (feature-flagged companion; off by default)
- [x] Calendar adapter package + mock + Google/Microsoft scaffolds (flagged off; this PR)
- Extract schema + review UI
- Sandbox tenant create
- Optional sandbox test call (no production path rewrite)
- Customer-facing call history / transcript for sandbox

## Phase 2 — Core receptionist parity (P0–P1)

- Knowledge base productisation + provenance
- Customer-facing calendar connect in the receptionist (adapters exist; not GA)
- Human transfer config in dashboard
- Summaries (email/SMS)
- Concurrent-call capacity design + load tests before claims

## Phase 3 — Platform (P1)

- Outbound campaigns
- SIP trunk option
- Public API + webhooks
- Analytics (answered / booked / transferred)
- Retention / ZDR controls

## Phase 4 — Vertical superiority (P1–P2)

- MaintenanceOS / trades packs (job intake, SLA language, UK safety)
- Property / letting templates
- Industry *OS portfolio under Chapelgate Technologies

## Definition of done (mission)

A working loop: **URL → knowledge → receptionist → voice test → dashboard**, with Fonio matrix P0 items at HAVE or honest PARTIAL, and no frozen-path regressions.
