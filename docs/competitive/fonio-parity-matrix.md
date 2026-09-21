# Fonio parity matrix — ReceptionistOS / MaintenanceOS

**Date:** 2026-09-20 (Europe/London)  
**Benchmark:** public Fonio site `https://www.fonio.ai/en/` (home, pricing, business AI phone assistant pages)  
**Our surfaces:** `chapelgate/maintenanceos-website` (marketing) + `chapelgate/maintenanceos-v1-pilot` (product; live telephony path **frozen** per `CURRENT_STATUS.md`)  
**Stance:** PRE-LAUNCH — no commercial GA claims.

## How to read

| Status | Meaning |
| --- | --- |
| HAVE | Present in source / staging with honest scope |
| PARTIAL | Exists but below Fonio useful bar or not customer-facing |
| MISSING | Not built / not productised |
| SUPERIOR | Stronger than Fonio on this axis (rare; must be evidenced) |

Columns: **FEATURE | FONIO (public) | CURRENT | GAP | BUILD/BUY/REUSE | PRIORITY | STATUS**

---

## Onboarding & website → receptionist

| FEATURE | FONIO (public) | CURRENT | GAP | BUILD/BUY/REUSE | PRIORITY | STATUS |
| --- | --- | --- | --- | --- | --- | --- |
| Enter business website URL to bootstrap assistant | Marketed (~30s create from website) | Claims-safe `/create` multi-step funnel (URL → check → draft → `create_receptionist` lead). No live number, no test-call button. | Wire scan service + sandbox tenant; do not claim 30s live phone | BUILD | P0 | PARTIAL (this PR: public create funnel) |
| AI extracts company knowledge from site | Claimed | Review UI + optional `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` → `packages/onboarding-ingest` (`POST /v1/onboarding/scan`). SSRF (https-only, DNS + redirect re-check), robots + caps, extract of `businessName`/`greeting`/`hours`/`services`/`faqs`. Flag `ONBOARDING_WEB_INGEST` defaults off. If endpoint unset, crawl is queued — no invented results. | Not production-hosted; no sandbox tenant/promote yet | BUILD | P0 | PARTIAL (flagged local/staging scan service) |
| Instant test call / “call my receptionist” | Marketed | Flagged `packages/sandbox-test-call` + `/create` panel (this PR). Default `SANDBOX_TEST_CALL_ENABLED=false`. Scripted / browser-mock demo against draft fields; WebRTC/live returns `not_configured` / `live_call_forbidden`. Not a live customer number; frozen telephony untouched. | Real media + sandbox tenant; do not claim Fonio voice quality | BUILD + REUSE pilot voice (later, flagged) | P0 | PARTIAL (this PR: flagged sandbox test-call foundation) |
| No-code assistant setup | Claimed | Streamlit supervisor internal | Customer dashboard | BUILD | P0 | PARTIAL |
| Voice + welcome message selection | 120+ voices | Limited pilot voices | Voice catalogue UX | BUILD/BUY TTS | P1 | PARTIAL |
| Languages | 60+ claimed | UK English focus | Expand after UK quality | BUILD/BUY | P2 | PARTIAL |

## Knowledge

| FEATURE | FONIO | CURRENT | GAP | BUILD/BUY/REUSE | PRIORITY | STATUS |
| --- | --- | --- | --- | --- | --- | --- |
| Knowledge base | Yes | Ops domain knowledge in source; not multi-tenant KB product | Modular RAG collections | BUILD | P0 | PARTIAL |
| Self-learning KB + human approve | Claimed | Improvement loop not productised | Propose→approve pipeline | BUILD | P1 | MISSING |
| PDF / document knowledge | Claimed | Not in marketing product | Doc ingest | BUILD | P1 | MISSING |
| Live website lookup mid-call | Claimed | Not present | Tool with allowlist + SSRF controls | BUILD | P1 | MISSING |
| Provenance per fact | Not emphasised | Action evidence culture in pilot | Carry into KB schema | BUILD — potential SUPERIOR | P0 | PARTIAL |

## Telephony

| FEATURE | FONIO | CURRENT | GAP | BUILD/BUY/REUSE | PRIORITY | STATUS |
| --- | --- | --- | --- | --- | --- | --- |
| Inbound AI answering | Yes | Twilio + Gemini Live in pilot (under testing / frozen live path) | Productise behind flags; do not rewrite live path | REUSE pilot | P0 | PARTIAL |
| Outbound + campaigns | Team+ | Not productised | Campaign engine | BUILD | P2 | MISSING |
| Human / dept transfer | Yes | Explicit-request human transfer in source | Dashboard config | REUSE | P0 | PARTIAL |
| Concurrent calls | Marketing up to ~15 | Capacity design docs; not claimed live | Load-test before claim | BUILD | P1 | PARTIAL |
| SIP trunk | Team+ | Not exposed | Provider abstraction | BUILD/BUY | P1 | MISSING |
| DTMF | Implied | DTMF 0 transfer in pilot | Expand schemas | REUSE | P1 | PARTIAL |
| Numbers (provision / BYO) | Included + €7 extra | Pilot Twilio numbers | Number inventory UX | BUILD/BUY | P1 | PARTIAL |

## Calendar & actions

| FEATURE | FONIO | CURRENT | GAP | BUILD/BUY/REUSE | PRIORITY | STATUS |
| --- | --- | --- | --- | --- | --- | --- |
| Calendar book / reschedule | Yes (Google/Microsoft etc.) | Adapter interface + mock + Google/Microsoft OAuth scaffolds in `packages/calendar-adapters`. Flag `CALENDAR_ADAPTERS_ENABLED` defaults off. `/create` shows “coming / under testing” unless `NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED` + mock/companion. No live phone booking. | Not customer-GA; OAuth operator-configured; no voice confirmation | BUILD | P0 | PARTIAL (this PR: flagged adapter foundation) |
| Tool/actions (jobs, tickets, CRM) | API/CRM integrations claimed | Deterministic ops + action evidence in pilot | Secure tool framework + adapters | REUSE + BUILD | P0 | PARTIAL |
| Structured variable extraction | Claimed | Partial in voice/ops | Configurable schemas | BUILD | P0 | PARTIAL |

## Post-call & analytics

| FEATURE | FONIO | CURRENT | GAP | BUILD/BUY/REUSE | PRIORITY | STATUS |
| --- | --- | --- | --- | --- | --- | --- |
| Recordings | Optional + delete | Policy-gated in pilot design | Customer controls | BUILD | P1 | PARTIAL |
| Transcripts + email/SMS summary | Yes | Session/transcript primitives + flagged `/dashboard` SAMPLE transcript view (`packages/customer-dashboard`). No email/SMS delivery. | Delivery channels | BUILD | P0 | PARTIAL (this PR: mock transcript view) |
| Call history search | Dashboard | Flagged `/dashboard` + `packages/customer-dashboard` mock store (SAMPLE/DEMO labelled). `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED` default false; off → coming / under testing. No live telephony history. | Not customer-GA; no live sessions; no search/analytics | BUILD | P0 | PARTIAL (this PR: flagged dashboard foundation) |
| Analytics (answered, booked, transferred) | Yes | Not customer analytics | Event pipeline | BUILD | P1 | MISSING |

## Platform / enterprise

| FEATURE | FONIO | CURRENT | GAP | BUILD/BUY/REUSE | PRIORITY | STATUS |
| --- | --- | --- | --- | --- | --- | --- |
| Multi-tenant isolation | SaaS | Tenant isolation in pilot source | Harden + prove | REUSE | P0 | PARTIAL |
| API + webhooks | Claimed | Internal API | Public API + signed webhooks | BUILD | P1 | MISSING |
| GDPR / retention / ZDR | Scale ZDR | Draft legal pages; governance docs | Product controls | BUILD | P1 | PARTIAL |
| SSO | Enterprise-ish | Not present | SSO-ready | BUILD | P2 | MISSING |
| Pricing presentation | Solo/Team/Scale public | Request pricing / launch list | Configurable plans later | BUILD | P1 | PARTIAL |
| Deterministic safety latch (money/safety) | Not a Fonio highlight | Core MOS differentiator | Keep & market carefully | REUSE — candidate SUPERIOR | P0 | SUPERIOR* |

\*SUPERIOR only vs typical AI-receptionist marketing: MOS refuses money execution and inventing bookings/dispatches; do not overclaim vs Fonio without side-by-side eval.

## UK / vertical

| FEATURE | FONIO | CURRENT | GAP | BUILD/BUY/REUSE | PRIORITY | STATUS |
| --- | --- | --- | --- | --- | --- | --- |
| UK 999 (not 911) | Generic intl | Locked in MOS source/tests | Keep | REUSE — SUPERIOR for UK | P0 | SUPERIOR |
| Maintenance / trades vertical templates | Generic | MaintenanceOS vertical | Property/trades packs | BUILD | P1 | PARTIAL |
| Industry *OS portfolio naming | N/A | LandlordOS…HolidayLetOS named | Sites + future verticals | BUILD | P1 | HAVE |

## Website marketing

| FEATURE | FONIO | CURRENT | GAP | BUILD/BUY/REUSE | PRIORITY | STATUS |
| --- | --- | --- | --- | --- | --- | --- |
| Polished commercial site | Yes | Pre-launch MOS site on DO free static | ReceptionistOS framing + create CTA | BUILD | P0 | PARTIAL |
| Pricing page clarity | Strong | Soft pricing / request demo | Honest early pricing when ready | BUILD | P2 | PARTIAL |

## Summary counts (launch-relevant)

- **HAVE:** industry *OS naming; UK safety posture in product source  
- **PARTIAL:** voice telephony pilot; transfers; evidence; supervisor; marketing site  
- **PARTIAL (P0 onboarding):** public `/create` multi-step funnel + draft review; crawl only if scan endpoint configured (else queued / early access).  
- **PARTIAL (P0 sandbox test call):** flagged `packages/sandbox-test-call` + `/create` panel (this PR). Scripted demo only; no live number; frozen path untouched.  
- **PARTIAL (P0 calendar):** flagged `packages/calendar-adapters` (mock + Google/Microsoft class); `/create` honest coming-soon unless local flag. Not customer-GA; no voice booking confirmation.  
- **PARTIAL (P0 dashboard):** flagged `/dashboard` + `packages/customer-dashboard` (SAMPLE/DEMO history, transcript, bookings stub). Off by default; empty store invents nothing. Not customer-GA; no live telephony.  
- **MISSING (P0):** production website→receptionist engine; live/WebRTC media; modular KB productisation  

**Do not modify frozen live telephony** until controlled-call gates in `CURRENT_STATUS.md` pass.


## Project-wide benchmark rule

**HARD RULE — applies to the whole MaintenanceOS / ReceptionistOS project.**

Fonio is the minimum competitive benchmark, not the target ceiling. Every product, website, onboarding, knowledge, voice, conversation-quality, telephony, integration, dashboard, analytics, reliability, safety, performance and customer-experience change must be assessed against the relevant Fonio capability.

- Do not knowingly regress below an already-achieved benchmark capability.
- Where Fonio has a relevant capability, aim to meet it at minimum and exceed it where practical and evidence supports doing so.
- New plans and acceptance criteria must explicitly consider the relevant Fonio parity gap.
- Never claim parity or superiority without evidence from comparable testing.
- This benchmark rule does **not** authorize changes to a frozen/live telephony path; normal safety, release and controlled-call gates still apply.
