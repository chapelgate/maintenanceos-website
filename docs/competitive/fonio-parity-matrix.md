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
| Enter business website URL to bootstrap assistant | Marketed (~30s create from website) | No public create funnel | Build `/create` + ingestion service | BUILD | P0 | MISSING |
| AI extracts company knowledge from site | Claimed | Not productised | SSRF-safe crawler + extract schema | BUILD | P0 | MISSING |
| Instant test call / “call my receptionist” | Marketed | Pilot voice under testing; not website-triggered | Wire create flow to sandbox tenant only | BUILD + REUSE pilot voice | P0 | PARTIAL |
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
| Calendar book / reschedule | Yes (Google/Microsoft etc.) | Not customer-facing | Calendar adapters | BUILD | P0 | MISSING |
| Tool/actions (jobs, tickets, CRM) | API/CRM integrations claimed | Deterministic ops + action evidence in pilot | Secure tool framework + adapters | REUSE + BUILD | P0 | PARTIAL |
| Structured variable extraction | Claimed | Partial in voice/ops | Configurable schemas | BUILD | P0 | PARTIAL |

## Post-call & analytics

| FEATURE | FONIO | CURRENT | GAP | BUILD/BUY/REUSE | PRIORITY | STATUS |
| --- | --- | --- | --- | --- | --- | --- |
| Recordings | Optional + delete | Policy-gated in pilot design | Customer controls | BUILD | P1 | PARTIAL |
| Transcripts + email/SMS summary | Yes | Session/transcript primitives | Delivery channels | BUILD | P0 | PARTIAL |
| Call history search | Dashboard | Supervisor tooling internal | Customer dashboard | BUILD | P0 | PARTIAL |
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
- **MISSING (P0):** public website→receptionist engine; customer create/test UX; calendar; customer dashboard; modular KB productisation  

**Do not modify frozen live telephony** until controlled-call gates in `CURRENT_STATUS.md` pass.
