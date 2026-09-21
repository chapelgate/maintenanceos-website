# ReceptionistOS feature matrix (build tracker)

Synced conceptually with `docs/competitive/fonio-parity-matrix.md`. Use this for sprint tracking.

| ID | Feature | Priority | Status | Owner lane |
| --- | --- | --- | --- | --- |
| R-01 | Public `/create` funnel (claims-safe) | P0 | PARTIAL (multi-step early access; no live phone) | Website |
| R-02 | SSRF-safe web ingest | P0 | PARTIAL (flagged companion in `packages/onboarding-ingest`; DNS/redirect re-check; off by default) | Platform |
| R-03 | Knowledge extract + review UI | P0 | PARTIAL (editable draft; service returns known strings only; invent-nothing on failure) | Platform |
| R-04 | Sandbox tenant + assistant | P0 | PLANNED | Platform |
| R-05 | Sandbox test call | P0 | PARTIAL (flagged `packages/sandbox-test-call`; `/create` coming-soon unless local flag; scripted stub only; no live number) | Voice (flagged) |
| R-06 | Calendar adapters | P0 | PARTIAL (flagged `packages/calendar-adapters`; mock + Google/Microsoft OAuth scaffolds; `/create` coming-soon unless local flag; no voice booking) | Integrations |
| R-07 | Customer dashboard (history/transcripts) | P0 | PARTIAL (flagged `/dashboard` + `packages/customer-dashboard`; SAMPLE/DEMO mock only; off by default; no live telephony) | App |
| R-08 | Provenance KB | P0 | PLANNED | Platform |
| R-09 | Human transfer config | P0 | PARTIAL (pilot) | Voice |
| R-10 | Summaries email/SMS | P0 | PLANNED | Comms |
| R-11 | Concurrent load proof | P1 | PLANNED | Perf |
| R-12 | SIP / BYO number | P1 | PLANNED | Telephony |
| R-13 | Outbound campaigns | P2 | PLANNED | Growth |
| R-14 | Public API + webhooks | P1 | PLANNED | Platform |
| R-15 | Vertical packs (Maintenance first) | P1 | PARTIAL | Product |
