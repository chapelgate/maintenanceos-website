# Phone AI feature inventory

**Owner:** MOS Positioning (cards) · MOS Product Investigator (gaps)
**Date:** 2026-09-30
**Website:** `chapelgate/maintenanceos-website`
**Stance:** PRE-LAUNCH — no commercial GA. Live always-on phone stays **NOT_ON_SITE / COMING**.

This file is the source of truth for `/features` marketing cards. Product evidence was refreshed directly against canonical `chapelgate/maintenanceos-v1-pilot` `main` at `498ad82dd87631814195d447d89458480b117951`, then bounded by `PRODUCT_CLAIMS_REGISTER.md`, `docs/competitive/fonio-parity-matrix.md`, and the existing website evidence. **Do not invent rows or promote commissioning evidence into a live-service claim.**

On-page promotion uses the **short marketing card set** only. Hard count (Positioning / Product Investigator): **exactly 7 cards — 5 VERIFIED + 2 UNDER TEST**. Do not add cards. The P0/P1 gap matrix stays **off the marketing page**.

## Status taxonomy

| Inventory status | Website use | Legacy HAVE / COMING map |
| --- | --- | --- |
| **VERIFIED** | Present-fact card. Still pre-launch product — not “buy now live service”. | HAVE, only when the claims register marks the row VERIFIED |
| **UNDER_TEST** | Careful “UNDER TEST / designed to” card. Not GA. | HAVE/PARTIAL website-repo rows F-01–F-05; calendar + dashboard PARTIAL |
| **NOT_ON_SITE** | Forbid list / “Not claimed” only. Never a present-capability card. | COMING, MISSING, NOT AVAILABLE |

**HAVE** on the Fonio matrix is not automatic VERIFIED. The website funnel/pack/sandbox/benchmark rows remain bounded by the claims register. The former public scan companion is retired from the current website path and is not a present capability.

## Groups

onboarding · knowledge · telephony · calendar/actions · post-call · UK maintenance vertical

---

## Short marketing card set (on-page) — exactly 7

Copy **only these seven** into `src/config/phone-ai-features.ts`. One UK-ops line each. Optional bullets stay inventory-faithful. Do not invent extra cards.

| ID | Group | Title | Status | UK-ops line | Bullets (optional) | Source |
| --- | --- | --- | --- | --- | --- | --- |
| M-ONB-01 | onboarding | Website-guided draft pack | UNDER_TEST | Enter a public website address, review and complete the draft, then prepare a knowledge pack — early access only. | Public `/create` path: Website → Check → Choose → Configure → Review & Pack, then an early-access lead. Exists today. Not a live receptionist or a 30-second phone number. Public website crawl is retired: the current path uses the zero-scan queued fallback and missing fields stay empty until reviewed or supplied. Knowledge pack + system prompt from the reviewed draft (F-03): missing keys stay missing; not a live tenant. | F-01; F-02 boundary; F-03 |
| M-TEL-01 | telephony | UK caller intake | VERIFIED | Designed to collect caller details in UK maintenance language, with 999 guidance (never 911) and no invented bookings. | UK terminology and 999 emergency guidance in product source and regressions. Receptionist designed to collect caller details. Must not invent bookings, dispatches, refunds, compensation, account information, or safety assurances. | V-02; V-03; V-05 |
| M-TEL-02 | telephony | Human transfer on request | VERIFIED | Callers can ask for a person; transfer is explicit-request-only in product source. | Shared policy across voice providers. Transfer quality on carrier remains under retest — not marketed as proven live. | V-04 (existence); V-10 (quality stays UNDER TEST, not a second card) |
| M-TEL-03 | telephony | AI voice receptionist | UNDER_TEST | Voice intake exists in product source and is under testing — not a public always-on maintenance line. | Provider-aware voice runtime exists in canonical product source. Current commissioning also has a pinned local/self-hosted candidate, but neither path is approved as a public always-on service. | V-01; V-11 |
| M-CAL-02 | calendar/actions | Rules own safety and money | VERIFIED | Deterministic server rules own lifecycle, approvals, and money boundaries — the model cannot execute client-money or invent a van. | AI does not override safety, lifecycle, or approvals. Critical-safety latch requires authorised human clearance. Escalation / human-review queues for RED cases. No payment, refund, compensation, fee-waiver, or client-money execution. | O-03; O-04; O-05; O-06 |
| M-POST-01 | post-call | Action evidence | VERIFIED | Affirmative operational claims are designed to need verified success evidence — not a live analytics dashboard. | Audit events and action-evidence patterns in product source. Tenant-scoped call-session records exist as part of the operating trail. | S-03; O-02 (call sessions) |
| M-UK-01 | UK maintenance vertical | Emergency triage vs jobs | VERIFIED | 999 is emergency services; a leaky tap stays a structured job. Critical safety is designed to latch for a person. | UK/999 guidance locked in product source (never 911). Danger latches for a person; routine fabric stays structured intake. | V-02; O-04; O-05; industries positioning |

Count: **M-TEL-01, M-TEL-02, M-CAL-02, M-POST-01, M-UK-01** = 5 VERIFIED. **M-ONB-01, M-TEL-03** = 2 UNDER TEST.

### Inventory rows not promoted on `/features`

These stay in this file for MOS Product Investigator. They are **not** present-fact marketing cards. Do not render them as capabilities.

| ID | Title | Status | Why off-page |
| --- | --- | --- | --- |
| M-KNO-01 | Website knowledge extract | NOT_ON_SITE | Public website crawl was retired from the current `/create` path. Do not market extraction as available; F-02 remains only as a historical/source boundary. |
| M-KNO-02 | Knowledge pack from reviewed draft | UNDER_TEST | Folded into M-ONB-01 bullets (F-03). |
| M-TEL-04 | Scripted sandbox and benchmark | UNDER_TEST | Scripted path only; not a third UNDER TEST promo card. See F-04 / F-05 in the gap matrix. |
| M-TEL-05 | Local/self-hosted voice commissioning candidate | UNDER_TEST | Product repo pins `CG-VOICE-0004` and its local TTS/ASR/VAD/turn stack for commissioning only. The source manifest explicitly says this is not final production acceptance. |
| M-CAL-01 | Calendar connect | UNDER_TEST | Not a present-fact card. Live book/reschedule stays on the forbid list (N-09). |
| M-POST-02 | Call history foundation | UNDER_TEST | SAMPLE dashboard only — not a promo card. |
| M-UK-02 | No client-money authority | VERIFIED | Covered by M-CAL-02 (O-06). Extra VERIFIED card would break the 5-card cap. |
| M-UK-03 | Industry \*OS naming | VERIFIED | Naming/positioning — not a Phone AI capability card. See `/industries/*`. |
| M-UK-04 | Maintenance trades language | UNDER_TEST | Positioning-only stronger copy. Product trades packs remain under test — not a promo card. |

---

## Not claimed / forbid list (NOT_ON_SITE · COMING)

These may appear only as a short “Not claimed” list. Never as present features.

| ID | Claim | Legacy | Source |
| --- | --- | --- | --- |
| N-01 | Live always-on customer phone / public receptionist number | COMING (frozen telephony) | V-07; V-08; matrix MISSING |
| N-02 | Commercially live / generally available product | NOT AVAILABLE | R-01 |
| N-03 | Concurrent multi-line capacity numbers | NOT AVAILABLE | V-09 |
| N-04 | Beats Fonio / Fonio voice-quality parity / “always-on phone as available” | omit | F-05 note; project benchmark rule |
| N-05 | Public customer portal, account login, or billing GA | NOT AVAILABLE | O-08 |
| N-06 | ISO / SOC 2 / bank-grade / other unearned certifications | NOT AVAILABLE | S-05 |
| N-07 | Fake uptime, logos, awards, or reviews | NOT AVAILABLE | S-06 |
| N-08 | Payment, refund, or client-money execution | omit (inverse of O-06) | O-06 |
| N-09 | Customer-facing live calendar book / reschedule | COMING | Matrix calendar gap |
| N-10 | Instant live number / 30-second live phone | omit | F-01 note |

**Verified but not a promo card:** V-06 (historical validation calls — test context only; do not market as social proof). O-01, O-07, S-01, S-02, S-04 stay in the claims register / security page — not Phone AI promo cards.

---

## Full inventory / P0–P1 gaps (Product Investigator — off-page)

Do **not** render this matrix on `/features`. Track build work here and in `docs/competitive/fonio-parity-matrix.md`.

### Onboarding

| Feature | Inventory status | Priority | Gap |
| --- | --- | --- | --- |
| Public `/create` funnel | UNDER_TEST (F-01; matrix HAVE for existence) | P0 | Production-hosted engine + sandbox tenant; do not claim 30s live phone |
| Knowledge pack → assistant prompt | UNDER_TEST (F-03; matrix PARTIAL) | P0 | Not a live tenant; not RAG / LLM knowledge builder |
| AI extracts company knowledge from site | UNDER_TEST (F-02; matrix PARTIAL) | P0 | Live scan on staging not evidenced; optional DigitalOcean companion is not enabled on the public staging build |
| Instant test call / “call my receptionist” | UNDER_TEST (F-04; matrix PARTIAL) | P0 | Real media + sandbox tenant; not Fonio voice quality |
| Conversation quality benchmark | UNDER_TEST for customer-facing claims (F-05; scripted HAVE) | P0 | Live-call barge-in SKIP/open; not voice-quality parity |
| No-code assistant setup | NOT_ON_SITE (matrix PARTIAL — Streamlit internal) | P0 | Customer dashboard setup UX |
| Voice + welcome catalogue | NOT_ON_SITE (matrix PARTIAL) | P1 | Voice catalogue UX |
| Languages beyond UK English | NOT_ON_SITE (matrix PARTIAL) | P2 | Expand after UK quality |

### Knowledge

| Feature | Inventory status | Priority | Gap |
| --- | --- | --- | --- |
| Knowledge base product | NOT_ON_SITE (matrix PARTIAL — ops knowledge + sandbox pack only) | P0 | Modular RAG collections; tenant KB |
| Self-learning KB + human approve | NOT_ON_SITE (MISSING) | P1 | Propose→approve pipeline |
| PDF / document knowledge | NOT_ON_SITE (MISSING) | P1 | Doc ingest |
| Live website lookup mid-call | NOT_ON_SITE (MISSING) | P1 | Tool with allowlist + SSRF controls |
| Provenance per fact | UNDER_TEST / PARTIAL (action evidence culture) | P0 | Carry into KB schema |

### Telephony

| Feature | Inventory status | Priority | Gap |
| --- | --- | --- | --- |
| Inbound AI answering (pilot source) | UNDER_TEST (V-01; matrix PARTIAL) | P0 | Provider-aware runtime exists; controlled carrier proof and production acceptance remain open |
| Local/self-hosted voice candidate | UNDER_TEST (V-11) | P0 | Commissioning pin only; benchmark and controlled-call evidence before any production promotion |
| Always-on live customer phone | NOT_ON_SITE (MISSING / frozen) | P0 | Controlled-call evidence; do not claim live |
| Outbound + campaigns | NOT_ON_SITE (MISSING) | P2 | Campaign engine |
| Human / dept transfer | VERIFIED existence (V-04); quality UNDER TEST (V-10) | P0 | Dashboard config; carrier retest |
| Concurrent calls | NOT_ON_SITE (V-09) | P1 | Load-test before any number claim |
| SIP trunk | NOT_ON_SITE (MISSING) | P1 | Provider abstraction |
| DTMF | NOT_ON_SITE (matrix PARTIAL — pilot) | P1 | Expand schemas |
| Numbers (provision / BYO) | NOT_ON_SITE (matrix PARTIAL — pilot Twilio) | P1 | Number inventory UX |

### Calendar & actions

| Feature | Inventory status | Priority | Gap |
| --- | --- | --- | --- |
| Calendar book / reschedule | UNDER_TEST (matrix PARTIAL) | P0 | Not customer-GA; M365 not live; no voice confirmation |
| Tool/actions (jobs, tickets, CRM) | VERIFIED ops objects in source (O-02); productisation PARTIAL | P0 | Secure tool framework + adapters |
| Structured variable extraction | NOT_ON_SITE as a marketed product (matrix PARTIAL) | P0 | Configurable schemas |

### Post-call & analytics

| Feature | Inventory status | Priority | Gap |
| --- | --- | --- | --- |
| Recordings | NOT_ON_SITE (matrix PARTIAL — policy-gated design) | P1 | Customer controls |
| Transcripts + email/SMS summary | UNDER_TEST view only (no email/SMS delivery) | P0 | Delivery channels |
| Call history search | UNDER_TEST flagged SAMPLE dashboard | P0 | Not customer-GA; no live sessions |
| Analytics (answered, booked, transferred) | NOT_ON_SITE (MISSING) | P1 | Event pipeline |

### UK / vertical

| Feature | Inventory status | Priority | Gap |
| --- | --- | --- | --- |
| UK 999 (not 911) | VERIFIED (V-02) | P0 | Keep |
| Maintenance / trades vertical templates | UNDER_TEST product packs; positioning-only stronger copy | P1 | Productised trades packs / live voice |
| Industry \*OS portfolio naming | VERIFIED (matrix HAVE) | P1 | Sites + future verticals |

**Do not modify frozen live telephony** until controlled-call gates in product `CURRENT_STATUS.md` pass.
