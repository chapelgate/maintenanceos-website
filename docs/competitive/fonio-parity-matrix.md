# Fonio parity matrix — ReceptionistOS / MaintenanceOS

**Date:** 2026-09-21 (Europe/London)  
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
| Enter business website URL to bootstrap assistant | Marketed (~30s create from website) | Claims-safe `/create` multi-step funnel (URL → check → draft → knowledge pack preview → `create_receptionist` lead). Local e2e stack (`docs/FONIO_LOCAL_E2E.md`) can wire flagged companions on loopback. No live number. | Production-hosted engine + sandbox tenant; do not claim 30s live phone | BUILD | P0 | PARTIAL (public create funnel; local e2e orchestration) |
| Knowledge pack → assistant prompt (sandbox) | Implied in website-to-assistant | `packages/receptionist-draft` `buildReceptionistDraft` + `/create` editable preview after draft review. Claims-safe system prompt from reviewed fields; missing keys stay missing; no live number / always-on claims. Sandbox session stores pack + prompt for scripted e2e. Contract: `docs/RECEPTIONIST_DRAFT_CONTRACT.md`. | Not a live tenant; not RAG / LLM knowledge builder; not Fonio-parity | BUILD | P0 | PARTIAL (knowledge→assistant draft; sandbox consume only) |
| AI extracts company knowledge from site | Claimed | Review UI + optional `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` → `packages/onboarding-ingest` (`POST /v1/onboarding/scan`). SSRF (https-only, DNS + redirect re-check), robots + caps. Claims-safe HTML extract of `businessName`/`greeting`/`hours`/`services`/`faqs` from JSON-LD, schema.org microdata, meta/title, labelled blocks, hours patterns, nav service labels, FAQ accordion-ish markup, and `tel:`/`mailto:` (contact hints land in `faqs`). Optional `fieldMeta` confidence/provenance; `/create` draft review shows per-field source + confidence hints on filled fields only (low-confidence marked; empty keys stay empty). Flag `ONBOARDING_WEB_INGEST` defaults off. If endpoint unset, crawl is queued — no invented results. Free-tier Render companion: `docs/ONBOARDING_SCAN_DEPLOY.md`. Staging operator checklist: `docs/STAGING_COMPANIONS.md`. | Not an LLM/JS-rendered knowledge builder; operator must host the companion and rebuild DO after setting `NEXT_PUBLIC_*`; no sandbox tenant/promote yet | BUILD | P0 | PARTIAL (stronger HTML extract + provenance; still flagged, not Fonio-parity) |
| Instant test call / “call my receptionist” | Marketed | Flagged `packages/sandbox-test-call` + `/create` panel. Default `SANDBOX_TEST_CALL_ENABLED=false`. Scripted / browser-mock demo is **pack-aware**: turns read the stored session knowledge pack + system prompt (reviewed name, hours, services, FAQs). Missing pack fields are answered as not on file — never invented. WebRTC/live returns `not_configured` / `live_call_forbidden`. Not a live customer number; frozen telephony untouched. Free-tier Render companion: `docs/SANDBOX_DEPLOY.md`. | Real media + sandbox tenant; do not claim Fonio voice quality; operator must host the companion and rebuild DO after setting `NEXT_PUBLIC_*` | BUILD + REUSE pilot voice (later, flagged) | P0 | PARTIAL (pack-aware scripted sandbox demo; still not live media) |
| No-code assistant setup | Claimed | Streamlit supervisor internal | Customer dashboard | BUILD | P0 | PARTIAL |
| Voice + welcome message selection | 120+ voices | Limited pilot voices | Voice catalogue UX | BUILD/BUY TTS | P1 | PARTIAL |
| Languages | 60+ claimed | UK English focus | Expand after UK quality | BUILD/BUY | P2 | PARTIAL |

## Knowledge

| FEATURE | FONIO | CURRENT | GAP | BUILD/BUY/REUSE | PRIORITY | STATUS |
| --- | --- | --- | --- | --- | --- | --- |
| Knowledge base | Yes | Ops domain knowledge in source; marketing `/create` now emits a claims-safe sandbox knowledge pack (`packages/receptionist-draft`) from reviewed draft fields. Not a multi-tenant KB product. | Modular RAG collections; tenant KB | BUILD | P0 | PARTIAL |
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
| Calendar book / reschedule | Yes (Google/Microsoft etc.) | Adapter interface + mock default + Google OAuth start/callback scaffold (`/oauth/google/start` → `/oauth/google/callback`, memory/file token store) and Microsoft env-token scaffold in `packages/calendar-adapters`. Flag `CALENDAR_ADAPTERS_ENABLED` defaults off. `/create` shows “coming / under testing” unless `NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED` + mock/companion. Optional $0 Render **mock** sibling: `docs/SANDBOX_DEPLOY.md`. No live phone booking. Google Calendar is **not** live on staging. | Not customer-GA; OAuth operator-configured locally; no voice confirmation | BUILD | P0 | PARTIAL (flagged adapter + local Google OAuth scaffold + optional free mock host) |
| Tool/actions (jobs, tickets, CRM) | API/CRM integrations claimed | Deterministic ops + action evidence in pilot | Secure tool framework + adapters | REUSE + BUILD | P0 | PARTIAL |
| Structured variable extraction | Claimed | Partial in voice/ops | Configurable schemas | BUILD | P0 | PARTIAL |

## Post-call & analytics

| FEATURE | FONIO | CURRENT | GAP | BUILD/BUY/REUSE | PRIORITY | STATUS |
| --- | --- | --- | --- | --- | --- | --- |
| Recordings | Optional + delete | Policy-gated in pilot design | Customer controls | BUILD | P1 | PARTIAL |
| Transcripts + email/SMS summary | Yes | Session/transcript primitives + flagged `/dashboard` SAMPLE transcript view (`packages/customer-dashboard`). No email/SMS delivery. Free-tier Render companion: `docs/DASHBOARD_DEPLOY.md`. | Delivery channels | BUILD | P0 | PARTIAL (mock transcript view + $0 host path) |
| Call history search | Dashboard | Flagged `/dashboard` + `packages/customer-dashboard` mock store (SAMPLE/DEMO labelled). `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED` default false; off → coming / under testing. No live telephony history. Free-tier Render companion: `docs/DASHBOARD_DEPLOY.md`. | Not customer-GA; no live sessions; no search/analytics | BUILD | P0 | PARTIAL (flagged dashboard foundation + $0 host path) |
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
- **PARTIAL (P0 sandbox test call):** flagged `packages/sandbox-test-call` + `/create` panel. Scripted demo is pack-aware (stored knowledge pack + system prompt); missing pack fields stay not on file. No live number; frozen path untouched. Free-tier Render companion: `docs/SANDBOX_DEPLOY.md` (flag off until configured; DO rebuild for `NEXT_PUBLIC_*`).  
- **PARTIAL (P0 calendar):** flagged `packages/calendar-adapters` (mock + Google/Microsoft class); `/create` honest coming-soon unless local/hosted flag. Optional mock service on the same free blueprint. Not customer-GA; no voice booking confirmation.  
- **PARTIAL (P0 dashboard):** flagged `/dashboard` + `packages/customer-dashboard` (SAMPLE/DEMO history, transcript, bookings stub). Off by default; empty store invents nothing. Not customer-GA; no live telephony. Free-tier Render companion: `docs/DASHBOARD_DEPLOY.md` (flag off until configured; DO rebuild for `NEXT_PUBLIC_*`).  
- **PARTIAL (local e2e orchestration):** `scripts/fonio-local-stack.sh` + `docker-compose.fonio-local.yml` + `.env.example.fonio-local` start scan/calendar/sandbox (dashboard optional) with flags ON for loopback only. Runbook: `docs/FONIO_LOCAL_E2E.md`. Smoke hits `/health` and asserts flags ON. **This is not production Fonio-parity.** DigitalOcean static `.env.example` stays flags-off / endpoints-empty.  
- **PARTIAL (P0 scan host):** `render.yaml` + `docs/ONBOARDING_SCAN_DEPLOY.md` describe a **new** Render **free** web service for `packages/onboarding-ingest`. Operator click: instance type **Free**; ingest remains off until `ONBOARDING_WEB_INGEST=true`; DO `NEXT_PUBLIC_*` needs a rebuild. Not frozen telephony.  
- **PARTIAL (P0 sandbox host):** `render.yaml` + `docs/SANDBOX_DEPLOY.md` describe **new** Render **free** web services `maintenanceos-sandbox-test-call` and optional mock `maintenanceos-calendar-adapters`. Distinct from scan and from frozen voice. Flags off until configured.  
- **PARTIAL (P0 dashboard host):** `render.yaml` + `docs/DASHBOARD_DEPLOY.md` describe a **new** Render **free** web service `maintenanceos-customer-dashboard`. Distinct from scan, sandbox, calendar, and frozen voice. Flag off until configured. SAMPLE / DEMO only — not production analytics.  
- **PARTIAL (P0 staging operator checklist):** `docs/STAGING_COMPANIONS.md` lists the four runbooks, exact DigitalOcean `NEXT_PUBLIC_*` names, rebuild, and cold-start wake order for `https://seahorse-app-4oasq.ondigitalocean.app/`. Docs only — does not create Render/DO resources.  
- **PARTIAL (P0 knowledge→assistant):** `packages/receptionist-draft` `buildReceptionistDraft` + `/create` preview after draft review. Claims-safe pack + system prompt; missing fields stay missing; sandbox session can store them. Not a live tenant and not Fonio-parity.  
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
