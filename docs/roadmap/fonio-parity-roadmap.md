# Fonio parity roadmap

**Benchmark:** Fonio public product (fonio.ai). Fonio is the **minimum** bar, not the ceiling.  
**Constraint:** frozen live telephony until controlled-call gates pass.  
**Verified through:** website `main` including PR **#49**, plus marketing `/demo` CTA alignment to the `/create` funnel. Live always-on phone remains **MISSING / frozen** — do not claim live.

## Phase 0 — Foundations (this PR / docs)

- [x] Competitive parity matrix
- [x] Architecture + onboarding + threat model + test plans (docs)
- [x] Claims-safe `/create` multi-step funnel **EXISTS** (not MISSING; preview / waitlist — not a live phone)
- [x] Marketing `/how-it-works` + `/features` match Website → Check → Review → Pack (HAVE / UNDER TEST / COMING for sandbox, calendars, live phone)
- [x] Marketing `/demo` + leftover “book a demo / see it live” CTAs point primary to `/create/`; human demo is secondary early-access (not a live phone)
- [ ] SCM access for Cursor cloud agents on private website repo

## Phase 1 — Website → sandbox receptionist (P0)

- [x] SSRF-safe website ingestion module (feature-flagged companion; **PARTIAL / UNDER TEST**; off by default; staging endpoint often unset; live scan on staging not evidenced)
- [x] Calendar adapter package + mock + Google OAuth start/callback scaffold + M365 / Outlook OAuth PARTIAL scaffold (flagged off; not live on staging)
- [x] Claims-safe knowledge pack + system prompt from reviewed `/create` draft (**PARTIAL**; `packages/receptionist-draft`; `/create` preview; sandbox consume; missing fields stay missing; no live-phone claims)
- Extract schema + review UI
- Sandbox tenant create
- [x] Optional sandbox test call foundation (flagged scripted/browser-mock; no production path rewrite)
- [x] Scripted sandbox demo answers from stored knowledge pack / system prompt (**PARTIAL**; missing fields not on file; still not live voice)
- [x] Scripted conversation benchmark fixtures + scorer (**HAVE** for scripted path: `npm run conversation-benchmark`; hours/services from pack; UK 999; no invented bookings / live-call success). Live-call barge-in **SKIP / open**.
- [ ] Live always-on customer phone (still **MISSING / frozen** — do not claim live)
- [x] Flagged customer dashboard foundation (history / transcript / bookings stubs; SAMPLE only)
- [x] Local e2e orchestration (stack script + compose + runbook; flags on locally only; not production Fonio-parity)
- [x] $0 scan companion deploy path (Render free web service + `docs/ONBOARDING_SCAN_DEPLOY.md`; ingest off until configured; DO rebuild required for `NEXT_PUBLIC_*`)
- [x] $0 sandbox test-call deploy path (Render free web service + `docs/SANDBOX_DEPLOY.md`; flag off until configured; scripted/WebRTC honesty; optional mock calendar sibling; DO rebuild required for `NEXT_PUBLIC_*`)
- [x] $0 customer-dashboard deploy path (Render free web service + `docs/DASHBOARD_DEPLOY.md`; flag off until configured; SAMPLE / DEMO only; DO rebuild required for `NEXT_PUBLIC_*`)
- [x] Staging companions operator checklist (`docs/STAGING_COMPANIONS.md`; four runbooks; exact DigitalOcean `NEXT_PUBLIC_*`; rebuild; cold-start wake order; docs only)
- Customer-facing call history / transcript wired to a sandbox tenant

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

- MaintenanceOS / trades packs (job intake, SLA language, UK safety) — marketing `/industries/*` now **PARTIAL (stronger) / SUPERIOR-in-positioning-only**; product packs still under test
- Property / letting templates
- Industry *OS portfolio under Chapelgate Technologies

## Definition of done (mission)

A working loop: **URL → knowledge → receptionist → voice test → dashboard**, with Fonio matrix P0 items at HAVE or honest PARTIAL, and no frozen-path regressions. Scripted conversation benchmark HAVE does **not** mean live-call or always-on phone.
