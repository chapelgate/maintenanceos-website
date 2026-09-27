# ReceptionistOS feature matrix (build tracker)

Synced conceptually with `docs/competitive/fonio-parity-matrix.md`. Use this for sprint tracking.

| ID | Feature | Priority | Status | Owner lane |
| --- | --- | --- | --- | --- |
| R-01 | Public `/create` funnel (claims-safe) | P0 | HAVE — multi-step funnel **EXISTS** (not MISSING); marketing `/how-it-works` + `/features` + `/demo` now match Website → Check → Choose → Review → Pack; primary CTA is `/create/`; human demo is secondary early-access; local e2e can wire companions; no live phone | Website |
| R-02 | SSRF-safe web ingest | P0 | PARTIAL / UNDER TEST (flagged companion in `packages/onboarding-ingest`; DNS/redirect re-check; off by default; staging endpoint often unset; $0 Render runbook `docs/ONBOARDING_SCAN_DEPLOY.md`) | Platform |
| R-03 | Knowledge extract + review UI | P0 | PARTIAL (editable draft; JSON-LD/microdata/heading/nav/hours-pattern/FAQ accordion + tel/mailto; per-field `fieldMeta` source/confidence review hints; invent-nothing on failure) | Platform |
| R-04 | Sandbox tenant + assistant | P0 | PARTIAL (knowledge pack + system prompt draft via `packages/receptionist-draft` + `/create` preview; sandbox session stores pack; no tenant/promote; no live number) | Platform |
| R-05 | Sandbox test call | P0 | PARTIAL (flagged `packages/sandbox-test-call`; pack-aware scripted demo; **not** a live phone; $0 Render runbook `docs/SANDBOX_DEPLOY.md`) | Voice (flagged) |
| R-16 | Conversation benchmark | P0 | HAVE for scripted path (`npm run conversation-benchmark`); live-call barge-in SKIP/open; not voice-quality parity | Voice (flagged) |
| R-06 | Calendar adapters | P0 | PARTIAL (flagged `packages/calendar-adapters`; mock default; Google OAuth start/callback scaffold; M365 / Outlook OAuth PARTIAL scaffold — not live; optional $0 mock host in `docs/SANDBOX_DEPLOY.md`; `/health` never claims M365 live on staging; no voice booking) | Integrations |
| R-07 | Customer dashboard (history/transcripts) | P0 | PARTIAL (flagged `/dashboard` + `packages/customer-dashboard`; SAMPLE/DEMO mock only; off by default; no live telephony; $0 Render runbook `docs/DASHBOARD_DEPLOY.md`) | App |
| R-08 | Provenance KB | P0 | PLANNED | Platform |
| R-09 | Human transfer config | P0 | PARTIAL (pilot) | Voice |
| R-10 | Summaries email/SMS | P0 | PLANNED | Comms |
| R-11 | Concurrent load proof | P1 | PLANNED | Perf |
| R-12 | SIP / BYO number | P1 | PLANNED | Telephony |
| R-13 | Outbound campaigns | P2 | PLANNED | Growth |
| R-14 | Public API + webhooks | P1 | PLANNED | Platform |
| R-15 | Vertical packs (Maintenance first) | P1 | PARTIAL (stronger) / SUPERIOR-in-positioning-only on `/industries/*`; product packs still under test | Product |
