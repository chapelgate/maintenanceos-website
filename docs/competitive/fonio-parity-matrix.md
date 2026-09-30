# Fonio parity matrix — ReceptionistOS / MaintenanceOS


**Date:** 2026-09-21 (Europe/London)
**Verified through:** current `chapelgate/maintenanceos-website` continuation candidate. Public funnel: website URL → check → choose role → configure → review & try → optional save. The paid hosted onboarding-scan component has been retired; missing business details stay blank. The browser receptionist preview is interactive and pack-aware. Live telephony remains separately commissioned.
**Benchmark:** public Fonio site `https://www.fonio.ai/en/` (home, pricing, business AI phone assistant pages)
**Our surfaces:** `chapelgate/maintenanceos-website` (marketing) + `chapelgate/maintenanceos-v1-pilot` (product; live telephony path **frozen** per `CURRENT_STATUS.md`)

**Stance:** PRE-LAUNCH — no commercial GA claims. Do **not** claim a live always-on phone.

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
| Enter business website URL to bootstrap assistant | Marketed (~30s create from website) | Public `/create` multi-step funnel **EXISTS** (URL → check → draft → knowledge pack preview → `create_receptionist` lead). Local e2e stack (`docs/FONIO_LOCAL_E2E.md`) can wire flagged companions on loopback. No live number. | Production-hosted engine + sandbox tenant; do not claim 30s live phone | BUILD | P0 | HAVE (public create funnel exists; not a live phone) |
| Knowledge pack → assistant prompt (sandbox) | Implied in website-to-assistant | `packages/receptionist-draft` `buildReceptionistDraft` + `/create` editable preview after draft review. Claims-safe system prompt from reviewed fields; missing keys stay missing; no live number / always-on claims. Sandbox session stores pack + prompt for scripted e2e. Contract: `docs/RECEPTIONIST_DRAFT_CONTRACT.md`. | Not a live tenant; not RAG / LLM knowledge builder; not Fonio-parity | BUILD | P0 | PARTIAL (knowledge pack + system prompt draft; sandbox consume only) |

| AI extracts company knowledge from site | Claimed | The former hosted onboarding-scan companion is retired from the public site. The URL is validated, missing business facts stay blank, and the user reviews/configures the receptionist manually. The historical SSRF-safe extractor remains repository evidence but is not a public runtime dependency. | No live automatic company-knowledge crawl is claimed | RETIRED / REUSE EVIDENCE | P0 | PREVIEW / NO PUBLIC CRAWL |
| Instant test call / ?call my receptionist? | Marketed | /create now exposes a public pack-aware interactive browser receptionist preview by default. The visitor can start the demo, type their own caller questions, and receive deterministic replies from the reviewed knowledge pack/system prompt. Missing pack fields are not invented. It does not dial a phone number, use the frozen production line, or claim live voice quality. The optional engineering qualification companion remains separately flag-gated. | Real telephone media remains a separate commissioning lane | REUSE deterministic conversation engine | P0 | HAVE (interactive browser preview; not live phone) |

| Conversation quality benchmark | Implied by marketed voice quality | Scripted runner `npm run conversation-benchmark` (`packages/sandbox-test-call`; `docs/testing/conversation-benchmark.md`). HAVE for the pack-aware **scripted** path (hours/services from pack, UK 999, no invented bookings, no fake live-call success). Live-call barge-in is **SKIP / open**. Passing the runner is **not** Fonio voice-quality parity. | Live media + barge-in eval; do not claim voice parity | BUILD | P0 | HAVE (scripted path); SKIP/open (live-call barge-in) |
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
| Inbound AI answering | Yes | Twilio + Gemini Live in pilot (under testing / frozen live path) | Productise behind flags; do not rewrite live path | REUSE pilot | P0 | PARTIAL (pilot source only) |
| Always-on live customer phone | Marketed | No public always-on number. Frozen live telephony until controlled-call gates in `CURRENT_STATUS.md` pass. | Controlled-call evidence; do **not** claim live | REUSE pilot | P0 | MISSING (frozen — do not claim live) |
| Outbound + campaigns | Team+ | Not productised | Campaign engine | BUILD | P2 | MISSING |
| Human / dept transfer | Yes | Explicit-request human transfer in source | Dashboard config | REUSE | P0 | PARTIAL |
| Concurrent calls | Marketing up to ~15 | Capacity design docs; not claimed live | Load-test before claim | BUILD | P1 | PARTIAL |
| SIP trunk | Team+ | Not exposed | Provider abstraction | BUILD/BUY | P1 | MISSING |
| DTMF | Implied | DTMF 0 transfer in pilot | Expand schemas | REUSE | P1 | PARTIAL |
| Numbers (provision / BYO) | Included + €7 extra | Pilot Twilio numbers | Number inventory UX | BUILD/BUY | P1 | PARTIAL |

## Calendar & actions

| FEATURE | FONIO | CURRENT | GAP | BUILD/BUY/REUSE | PRIORITY | STATUS |
| --- | --- | --- | --- | --- | --- | --- |
| Calendar book / reschedule | Yes (Google/Microsoft etc.) | Adapter interface + mock default + **Google OAuth** start/callback scaffold and **M365 / Outlook OAuth PARTIAL scaffold** (`/oauth/microsoft/start` → `/oauth/microsoft/callback`, memory/file token store; Graph list/book when credentials + refresh token present). Flag `CALENDAR_ADAPTERS_ENABLED` defaults off. `/create` shows “coming / under testing” unless `NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED` + mock/companion. Optional $0 Render **mock** sibling: `docs/SANDBOX_DEPLOY.md`. No live phone booking. Google / Microsoft 365 Calendar is **not** live on staging. | Not customer-GA; OAuth operator-configured locally; M365 not a live product; no voice confirmation | BUILD | P0 | PARTIAL (Google OAuth scaffold; M365 PARTIAL scaffold, not live) |
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
| GDPR / retention / ZDR | Scale ZDR | Draft legal pages; `/create` + `/privacy` now state that the submitted website URL is stored with the early-access request and used as a setup hint. The current public site does not crawl submitted pages; lead email is early-access only and not live telephony data. No DPO invented. | Product controls; counsel review of draft copy | BUILD | P1 | PARTIAL |
| SSO | Enterprise-ish | Not present | SSO-ready | BUILD | P2 | MISSING |
| Pricing presentation | Solo/Team/Scale public | Request pricing; Create from website CTA; no live phone in a plan | Configurable plans later | BUILD | P1 | PARTIAL |
| Deterministic safety latch (money/safety) | Not a Fonio highlight | Core MOS differentiator | Keep & market carefully | REUSE — candidate SUPERIOR | P0 | SUPERIOR* |

\*SUPERIOR only vs typical AI-receptionist marketing: MOS refuses money execution and inventing bookings/dispatches; do not overclaim vs Fonio without side-by-side eval.

## UK / vertical

| FEATURE | FONIO | CURRENT | GAP | BUILD/BUY/REUSE | PRIORITY | STATUS |
| --- | --- | --- | --- | --- | --- | --- |
| UK 999 (not 911) | Generic intl | Locked in MOS source/tests | Keep | REUSE — SUPERIOR for UK | P0 | SUPERIOR |
| Maintenance / trades vertical templates | Generic AI receptionist (24/7 answer + book visits) | `/industries/*` now names emergency triage vs jobs, contractor-dispatch language, out-of-hours honesty, 999 vs jobs, and no client-money. Product trades packs still under test. | Productised trades packs / live voice | BUILD | P1 | PARTIAL (stronger) / SUPERIOR-in-positioning-only |
| Industry *OS portfolio naming | N/A | LandlordOS…HolidayLetOS named | Sites + future verticals | BUILD | P1 | HAVE |

## Website marketing

| FEATURE | FONIO | CURRENT | GAP | BUILD/BUY/REUSE | PRIORITY | STATUS |
| --- | --- | --- | --- | --- | --- | --- |
| Polished commercial site | Yes | Pre-launch MOS site on DO free static | ReceptionistOS framing + create CTA | BUILD | P0 | PARTIAL |
| How-it-works + Features vs /create funnel | Markets ~30s live assistant | **Were lagging:** older pages used the former pack/sandbox wording. **Now aligned:** /how-it-works and the shared funnel use Website → Check → Choose → Configure → Review & Try; /features presents customer-facing VERIFIED / PREVIEW labels while retaining internal evidence statuses. | Keep marketing pages in lockstep when the funnel changes; do not claim live phone | BUILD | P0 | HAVE (narrative aligned; still not a live phone) |
| Demo / “see it live” CTAs vs `/create` funnel | Markets a live phone demo | **Were lagging:** `/demo` still said “book a walkthrough / see it”; leftover CTAs treated Request early demo as the primary path. **Now aligned:** `/demo` names Website → Check → Choose → Configure → Review & Pack → optional sandbox → early access; primary CTA is Create from website; human demo is secondary early-access, not live number provisioning. | Do not revive “call our AI now” or live-number CTAs | BUILD | P0 | HAVE (demo CTAs aligned; still not a live phone) |
| SEO titles / descriptions / OG vs /create funnel | Markets ~30s live assistant | **Were lagging:** metadata used the former Review & Pack / sandbox path. **Now aligned:** customer funnel copy uses Website → Check → Choose → Configure → Review & Try with optional save, and keeps live-phone/GA boundaries explicit. | Keep metadata in lockstep; do not imply live phone / always-on / GA | BUILD | P0 | HAVE (SEO meta aligned; still not a live phone) |
| JSON-LD on home + funnel pages | Product / how-to schema | **Were site-wide only:** Organization + WebSite + SoftwareApplication with a PreOrder offer on every page; no WebPage. **Now aligned:** shared `funnelPageJsonLd` emits Organization + WebSite + WebPage + SoftwareApplication on `/`, `/create`, `/demo`, `/how-it-works`, and `/features` from `funnelPageCopy`. Layout keeps Organization + WebSite. SoftwareApplication has no telephone, ratings, or offers. FAQPage on `/faq/` now shares the same funnel answers (see FAQ row). | Keep schema in lockstep with SEO copy; do not add live phone, always-on, GA, aggregateRating, or fake offers | BUILD | P0 | HAVE (claims-safe JSON-LD; still not a live phone) |

| llms.txt / llms-full.txt vs /create funnel | Markets ~30s live assistant | Machine-readable copy is required to follow the same verified public state: website URL → check → configure → review → interactive receptionist preview → optional save; hosted scan retired; no live phone/always-on/GA claim. | Keep machine-readable copy in lockstep | BUILD | P0 | HAVE / REFRESH WITH RELEASE |
| FAQ + FAQPage JSON-LD vs /create funnel | Markets ~30s live assistant | Shared FAQ copy now names the interactive browser preview, optional save, retired hosted crawl, missing-field honesty, UK 999, and no public always-on phone. | Keep FAQ copy in lockstep | BUILD | P0 | HAVE (FAQ aligned; still not a live phone) |
| Privacy note vs `/create` website-URL ingest | Markets instant create; privacy elsewhere | **Were lagging:** `/create` form footer only said pre-launch / no live phone line; legal scaffolds did not name website-URL ingest. **Now aligned:** shared `CREATE_INGEST_PRIVACY_NOTE` on `/create` (DRAFT FOR LEGAL REVIEW) and `/privacy/#website-url-ingest`. Cookies/terms point at that draft. Public pages may be fetched when scan is configured; no invented crawl; lead email early-access only; not live telephony data. No DPO invented. | Keep ingest privacy copy in lockstep; do not invent GDPR counsel or live telephony processing | BUILD | P0 | HAVE (privacy note aligned; still not live telephony data) |
| Pricing page clarity | Strong public tiers | **Were already honest on the card:** no £, no GA, no live phone in a plan; primary CTA `/create/`. **Lag remaining:** SEO/FAQ/llms said request pricing / launch list only and did not label telephony/calendar as coming. **Now aligned:** same request-pricing card; Create from website primary; no invented £; telephony and calendar coming / early access. FAQ + llms match. | Keep empty tiers; do not invent list prices or a live phone in a plan | BUILD | P2 | HAVE (pricing copy aligned; still not published list prices) |
| Contact / enquiry CTAs vs `/create` funnel | Markets live sales / support | **Were already honest on the page:** general enquiries; public path `/create`; launch-list and briefing on `/demo`; not a live phone. **Lag remaining:** SEO/FAQ/llms said “general enquiries” only and did not say not a support desk / not live phone provisioning / no invented SLA. **Now aligned:** same contact form; Create from website for product interest; contact is human enquiry / early access. FAQ + llms match. | Keep contact as human enquiry; do not invent SLAs or a GA support desk | BUILD | P2 | HAVE (contact copy aligned; still not a support desk) |
| Security / trust marketing vs certifications | Markets enterprise trust | Trust copy remains designed-control language: no ISO/SOC 2/bank-grade claims. The historical extractor was designed with SSRF controls but the hosted scan is disabled/retired from the public site; no live crawl is claimed. Legal pages remain DRAFT FOR LEGAL REVIEW. | Keep designed-control language; do not invent certifications or a live crawl | BUILD | P2 | HAVE (security copy aligned; still not certified) |

| Cookie / consent banner vs analytics | Markets consent + GA | **Were already honest as DRAFT:** no site-wide banner; inventory empty; settings stub; no invented cookie names. **Lag remaining:** analytics status said “prepared but inactive”; FAQ/llms did not say no banner / no analytics / no GA certification. **Now aligned:** no site-wide banner; no analytics or marketing cookies; no third-party analytics tag; cookieless first-party aggregate measurement only, with no persistent visitor identifier; DRAFT FOR LEGAL REVIEW; links to privacy/cookies drafts; no GA / PECR / GDPR compliance certification. FAQ + llms match. | Do not invent tracking or a consent banner; do not claim GA certification | BUILD | P2 | HAVE (cookies copy aligned; DRAFT; cookieless first-party measurement only) |

## Summary counts (launch-relevant)


- **HAVE:** industry *OS naming; UK safety posture in product source; public `/create` multi-step funnel **EXISTS** (not MISSING); conversation benchmark **scripted** path (`npm run conversation-benchmark`); marketing `/how-it-works` + `/features` + `/demo` narrative now matches that funnel (was lagging after #47/#49); funnel-page titles / descriptions / OG now name the same path (was lagging after #51); claims-safe JSON-LD on home + funnel pages (Organization + WebSite + WebPage + SoftwareApplication; no telephone / ratings / offers); `llms.txt` / `llms-full.txt` now name the same path (was lagging after #56); `/faq/` + FAQPage JSON-LD now name the same path (was lagging after #57); `/create` + `/privacy` website-URL ingest privacy note (DRAFT; was lagging after #58); `/pricing` request-pricing card was already honest (no £ / no GA / no live phone in a plan; Create CTA) — SEO/FAQ/llms + telephony/calendar coming language now match (was lagging after #59); `/contact` form was already honest (human enquiry; `/create` primary) — SEO/FAQ/llms now say not a support desk / not live phone provisioning / no invented SLA (was lagging after #60); `/security` page was already honest (designed controls; no ISO/SOC 2) — SEO/FAQ/llms now name SSRF-safe scan under test, no bank-grade fluff, DRAFT legal, and Create CTA (was lagging after #61); `/cookies` page was already DRAFT-honest (no banner; empty inventory) — leftover “prepared but inactive” analytics language and FAQ/llms silence on no banner / no analytics / no GA certification now match (was lagging after #63)
- **PARTIAL (stronger) / SUPERIOR-in-positioning-only (UK vertical):** `/industries/*` copy now contrasts UK maintenance (999 vs jobs, contractor-dispatch language, out-of-hours honesty, no client-money) with a generic AI receptionist. Product features remain under test — not a live always-on phone or GA. Do not claim product superiority beyond positioning.
- **PARTIAL:** voice telephony pilot (not public always-on); transfers; evidence; supervisor; marketing site
- **RETIRED PUBLIC SCAN:** the paid hosted onboarding-scan component has been removed. /create no longer depends on it; missing business details stay blank and are reviewed manually.
- **PARTIAL (P0 knowledge pack):** `packages/receptionist-draft` + `/create` preview after draft review. Claims-safe pack + system prompt; missing fields stay missing. Not a live tenant.
- **HAVE (interactive browser receptionist preview):** /create exposes the pack-aware deterministic conversation engine publicly after review. It is interactive text-in-browser only; live telephone remains separate.
- **HAVE (P0 conversation benchmark, scripted):** `npm run conversation-benchmark` scores pack hours/services, missing-field honesty, UK 999, and no invented bookings / live-call lies. Live-call barge-in remains **SKIP / open**. Passing the runner is not Fonio voice-quality parity.
- **PARTIAL (P0 calendar):** flagged `packages/calendar-adapters` — mock + **Google OAuth scaffold** + **M365 PARTIAL scaffold** (not live). `/create` honest coming-soon unless local/hosted flag. Optional mock service on the same free blueprint. Not customer-GA; no voice booking confirmation. `/health` always reports `microsoftCalendarLiveOnStaging: false`.
- **PARTIAL (P0 dashboard):** flagged `/dashboard` + `packages/customer-dashboard` (SAMPLE/DEMO history, transcript, bookings stub). Off by default; empty store invents nothing. Not customer-GA; no live telephony. Free-tier Render companion: `docs/DASHBOARD_DEPLOY.md` (flag off until configured; DO rebuild for `NEXT_PUBLIC_*`).
- **PARTIAL (local e2e orchestration):** `scripts/fonio-local-stack.sh` + `docker-compose.fonio-local.yml` + `.env.example.fonio-local` start scan/calendar/sandbox (dashboard optional) with flags ON for loopback only. Runbook: `docs/FONIO_LOCAL_E2E.md`. Smoke hits `/health` and asserts flags ON. **This is not production Fonio-parity.** DigitalOcean static `.env.example` stays flags-off / endpoints-empty.
- **PARTIAL (P0 scan host):** `docs/ONBOARDING_SCAN_DEPLOY.md` describes a **DigitalOcean droplet** for `packages/onboarding-ingest` (Docker or systemd). `render.yaml` is **legacy / do not use**. Ingest remains off until `ONBOARDING_WEB_INGEST=true`; DO `NEXT_PUBLIC_*` needs a rebuild. Not frozen telephony.
- **PARTIAL (P0 sandbox host):** `render.yaml` + `docs/SANDBOX_DEPLOY.md` describe **new** Render **free** web services `maintenanceos-sandbox-test-call` and optional mock `maintenanceos-calendar-adapters`. Distinct from scan and from frozen voice. Flags off until configured.
- **PARTIAL (P0 dashboard host):** `render.yaml` + `docs/DASHBOARD_DEPLOY.md` describe a **new** Render **free** web service `maintenanceos-customer-dashboard`. Distinct from scan, sandbox, calendar, and frozen voice. Flag off until configured. SAMPLE / DEMO only — not production analytics.
- **PARTIAL (P0 staging operator checklist):** `docs/STAGING_COMPANIONS.md` and `docs/FONIO_WEBSITE_READINESS.md` list the runbooks, exact DigitalOcean `NEXT_PUBLIC_*` names, rebuild, and health-check order for `https://seahorse-app-4oasq.ondigitalocean.app/`. Owner blocker: droplet + `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` + static rebuild. Docs only — does not create DigitalOcean or Render resources.
- **MISSING (P0):** live always-on customer phone (**frozen** — do not claim live); production website→receptionist engine; live/WebRTC media; modular KB productisation


**Do not modify frozen live telephony** until controlled-call gates in `CURRENT_STATUS.md` pass.


## Project-wide benchmark rule

**HARD RULE — applies to the whole MaintenanceOS / ReceptionistOS project.**

Fonio is the minimum competitive benchmark, not the target ceiling. Every product, website, onboarding, knowledge, voice, conversation-quality, telephony, integration, dashboard, analytics, reliability, safety, performance and customer-experience change must be assessed against the relevant Fonio capability.

- Do not knowingly regress below an already-achieved benchmark capability.
- Where Fonio has a relevant capability, aim to meet it at minimum and exceed it where practical and evidence supports doing so.
- New plans and acceptance criteria must explicitly consider the relevant Fonio parity gap.
- Never claim parity or superiority without evidence from comparable testing.
- This benchmark rule does **not** authorize changes to a frozen/live telephony path; normal safety, release and controlled-call gates still apply.
