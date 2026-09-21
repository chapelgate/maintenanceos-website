# ReceptionistOS feature matrix (build tracker)

Synced conceptually with `docs/competitive/fonio-parity-matrix.md`. Use this for sprint tracking.

| ID | Feature | Priority | Status | Owner lane |
| --- | --- | --- | --- | --- |
| R-01 | Public `/create` funnel (claims-safe) | P0 | PARTIAL (multi-step early access; local e2e stack can wire companions; no live phone) | Website |
| R-02 | SSRF-safe web ingest | P0 | PARTIAL (flagged companion in `packages/onboarding-ingest`; DNS/redirect re-check; off by default; $0 Render runbook `docs/ONBOARDING_SCAN_DEPLOY.md`) | Platform |
| R-03 | Knowledge extract + review UI | P0 | PARTIAL (editable draft; JSON-LD/microdata/heading/nav/hours-pattern/FAQ accordion + tel/mailto; per-field `fieldMeta` source/confidence review hints; invent-nothing on failure) | Platform |
| R-04 | Sandbox tenant + assistant | P0 | PLANNED | Platform |
| R-05 | Sandbox test call | P0 | PARTIAL (flagged `packages/sandbox-test-call`; scripted stub only; no live number; $0 Render runbook `docs/SANDBOX_DEPLOY.md`) | Voice (flagged) |
| R-06 | Calendar adapters | P0 | PARTIAL (flagged `packages/calendar-adapters`; mock default; Google OAuth start/callback + token store scaffold; Microsoft env-token stub; optional $0 mock host in `docs/SANDBOX_DEPLOY.md`; not live Google on staging; no voice booking) | Integrations |
| R-07 | Customer dashboard (history/transcripts) | P0 | PARTIAL (flagged `/dashboard` + `packages/customer-dashboard`; SAMPLE/DEMO mock only; off by default; no live telephony; $0 Render runbook `docs/DASHBOARD_DEPLOY.md`) | App |
| R-08 | Provenance KB | P0 | PLANNED | Platform |
| R-09 | Human transfer config | P0 | PARTIAL (pilot) | Voice |
| R-10 | Summaries email/SMS | P0 | PLANNED | Comms |
| R-11 | Concurrent load proof | P1 | PLANNED | Perf |
| R-12 | SIP / BYO number | P1 | PLANNED | Telephony |
| R-13 | Outbound campaigns | P2 | PLANNED | Growth |
| R-14 | Public API + webhooks | P1 | PLANNED | Platform |
| R-15 | Vertical packs (Maintenance first) | P1 | PARTIAL | Product |
