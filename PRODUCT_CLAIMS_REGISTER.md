# PRODUCT_CLAIMS_REGISTER.md — SIGNED (VERIFIED-ONLY APPROVAL)

**Signer:** MOS Product Investigator  
**Signed:** 2026-09-18 13:15 BST  
**Product source:** `chapelgate/maintenanceos-v1-pilot` (`main`)  
**Checkpoint:** `CURRENT_STATUS.md` dated 2026-09-14  
**Also reviewed:** README.md, ARCHITECTURE.md, DECISION_BOOK.md, PILOT_CHECKLIST.md, STAGED_VOICE_INTEGRATION.md, FINALISATION_10_STEPS.md  
**Website mode:** PRE-LAUNCH  

## Hard gates

- **Commercially live / GA:** NOT AVAILABLE — never claim
- **Telephony controlled Gemini call:** NOT AVAILABLE — **NO-GO**
- **Present-fact marketing copy:** **VERIFIED rows only** (this section)
- UNDER TEST / PLANNED / NOT AVAILABLE must not be stated as present commercial fact

## Taxonomy

| Status | Website use |
|---|---|
| **VERIFIED** | Only status approved as present fact (still PRE-LAUNCH product, not “buy now live service”) |
| **UNDER TEST** | “Under testing / designed to” only — not GA |
| **PLANNED** | Label as planned |
| **NOT AVAILABLE** | Omit |

---

# APPROVED FOR PRESENT-FACT COPY (VERIFIED ONLY)

| ID | Claim | Evidence |
|---|---|---|
| V-02 | UK terminology and 999 (never 911) emergency guidance in product source and regressions | README; PR #25 lane; FINALISATION step 6; PILOT voice tests |
| V-03 | Receptionist collects caller details (product design/source) | README |
| V-04 | Explicit caller-request human transfer exists in source + CI (Gemini and OpenAI share policy) | CURRENT_STATUS: PR #25 merged `1f4ba147…` |
| V-05 | Must not invent bookings, dispatches, refunds, compensation, account information, or safety assurances | README; voice_policy / action_evidence architecture |
| V-06 | Historical real receptionist / validation calls have occurred (test/validation context only — not commercial GA) | README; CURRENT_STATUS; PILOT_CHECKLIST |
| O-01 | Multi-tenant maintenance-operations system | README |
| O-02 | Tenant-scoped properties, residents, contractors, work orders, jobs, communications, exports, action evidence, call sessions (in product source) | README |
| O-03 | Deterministic server rules own safety, lifecycle, and approvals; AI does not override | README; ARCHITECTURE; DECISION_BOOK |
| O-04 | Critical-safety latch requiring authorised human clearance | ARCHITECTURE |
| O-05 | Escalation queues / HUMAN_REVIEW for RED cases | README; ARCHITECTURE; DECISION_BOOK |
| O-06 | Quote/invoice checks exist; **no** payment, refund, compensation, fee-waiver, or client-money execution | README; DECISION_BOOK |
| O-07 | Streamlit supervisor dashboard exists as internal supervisor tooling | README; ARCHITECTURE |
| S-01 | Tenant isolation controls in source | ARCHITECTURE `tenant_security.py` |
| S-02 | Twilio HTTP/WSS signature verification implemented in source | README |
| S-03 | Audit events / action evidence; affirmative operational claims need verified success evidence | ARCHITECTURE `action_evidence.py` |
| S-04 | Cloud CI and Security CI baseline pass on canonical application code | CURRENT_STATUS; FINALISATION step 2 |
| R-04 | Local acceptance evidenced 2026-09-10: full pytest pass, local-closed readiness, SQLite backup/restore | PILOT_CHECKLIST |

**Wording rule for VERIFIED:** state as product capability that exists in MaintenanceOS. Do **not** imply commercially live phone line, public production access, or general availability.

---

# NOT APPROVED AS PRESENT FACT

## UNDER TEST (careful language only)

| ID | Claim | Note |
|---|---|---|
| V-01 | AI receptionist (Gemini Live primary) in source | Capability under testing — not live commercial service |
| V-10 | Live human-transfer answer / no-answer on carrier | Historical mixed outcomes; retest open |
| R-02 / R-03 | Public / production hosting | Doc conflict: CURRENT_STATUS vs FINALISATION on DO host identity; API loopback-only per CURRENT_STATUS — do not market public production |
| F-01 | Public `/create` multi-step website→receptionist funnel | Funnel **EXISTS** in this repo (not MISSING). Early-access / preview only — not a live receptionist. Keep UNDER TEST as a productised website-to-assistant until live scan on staging is evidenced. |
| F-02 | SSRF-safe scan companion extracts company knowledge from a URL | PARTIAL / UNDER TEST. Flagged `packages/onboarding-ingest`; `ONBOARDING_WEB_INGEST` off by default; staging `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` often unset (queued crawl). Do not claim live Fonio-parity scan. |
| F-03 | Knowledge pack + system prompt from reviewed `/create` draft | PARTIAL. `packages/receptionist-draft` + `/create` preview. Missing fields stay missing. Not a live tenant / RAG KB. UNDER TEST until live scan on staging is evidenced. |
| F-04 | Pack-aware scripted sandbox test call | PARTIAL. Flagged scripted / browser-mock only — **not** a live phone. WebRTC/live forbidden. Frozen telephony unused. |
| F-05 | Conversation quality vs Fonio | HAVE for the **scripted** path (`npm run conversation-benchmark`). Live-call barge-in SKIP/open. Passing the runner is not voice-quality parity. UNDER TEST for any customer-facing conversation-quality claim. |

## PLANNED

| ID | Claim |
|---|---|
| R-05 | Production blockers (governance, SSO/MFA, pen test, legal, insurance, etc.) |

## NOT AVAILABLE (omit / forbidden)

| ID | Claim |
|---|---|
| V-07 | Controlled Gemini call on canonical deployment — **NO-GO** |
| V-08 | Public production voice / Twilio media streaming proven on canonical runtime |
| V-09 | Concurrent multi-line capacity numbers |
| O-08 | Public customer portal / account login / billing GA |
| O-09 | Live email / messaging / remote AI side effects as “live now” |
| R-01 | Commercially generally available / production customer call pilot |
| S-05 | Certifications (ISO, SOC2, etc.) |
| S-06 | Fake uptime, logos, awards, reviews |

---

## Required CTAs

Join launch list / Request early demo. Pricing: request pricing / launching soon.

## Signature

```
SIGNED-BY: MOS Product Investigator
DATE: 2026-09-18T13:15:00+01:00
PRODUCT_REPO: chapelgate/maintenanceos-v1-pilot
WEBSITE_PATH: PRODUCT_CLAIMS_REGISTER.md
PRESENT_FACT: VERIFIED rows only
COMMERCIALLY_LIVE: NO
TELEPHONY_CONTROLLED_CALL: NO-GO
```

**Fonio amendment (2026-09-21):** added website-repo rows **F-01–F-05** under UNDER TEST so `/create`, scan, knowledge pack, scripted sandbox, and conversation-benchmark claims stay non-present-fact until live scan on staging is evidenced. VERIFIED rows and the signature above are unchanged. Do not claim a live always-on phone.

**Fonio amendment (2026-09-21, /demo CTAs):** the public primary CTA is now **Create from website** (`/create/`). Join launch list / Request early demo remain allowed secondary conversions. Request early demo is a human early-access briefing — not live number provisioning. VERIFIED rows and the signature above are unchanged.

**Fonio amendment (2026-09-21, /pricing):** `/pricing` stays request-pricing / launching soon. No live phone included in a plan, no GA, no invented £ figures. Primary CTA is Create from website (`/create/`). Telephony and calendar: early access / coming. VERIFIED rows and the signature above are unchanged.

**Fonio amendment (2026-09-21, /contact):** `/contact` is for genuine human enquiries / early access. Primary path for product interest is Create from website (`/create/`). Not live phone provisioning, not a GA support desk, no invented SLAs. VERIFIED rows and the signature above are unchanged.

**Fonio amendment (2026-09-21, /security):** `/security` stays a designed-control trust posture. SSRF-safe website scan is UNDER TEST (F-02) — not a live crawl. No ISO/SOC2/bank-grade claims (S-05). Legal pages remain DRAFT FOR LEGAL REVIEW. Product interest starts at Create from website (`/create/`). VERIFIED rows and the signature above are unchanged.

**Fonio amendment (2026-09-21, /cookies):** `/cookies` stays a DRAFT FOR LEGAL REVIEW scaffold. No site-wide consent banner (no non-essential tags). No analytics or marketing tags today — not “prepared”. If analytics is added later, it stays off until consent. No invented tracking and no Google Analytics / PECR / GDPR compliance certification. Footer Cookie settings opens the draft notice, not a live preference centre. VERIFIED rows and the signature above are unchanged.
