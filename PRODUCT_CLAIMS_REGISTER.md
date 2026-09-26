# PRODUCT_CLAIMS_REGISTER.md — SIGNED (VERIFIED-ONLY APPROVAL)

**Signer:** MOS Product Investigator
**Signed:** 2026-09-26
**Product source:** `chapelgate/maintenanceos-v1-pilot` (`main`)
**Product checkpoint:** `cc682c3e5dc5a50e6d8ea695767b3e0f1f6f09c8`
**Current-status document reviewed:** `CURRENT_STATUS.md` dated 2026-09-20
**Also reviewed:** `README.md`, `ARCHITECTURE.md`, `DECISION_BOOK.md`,
`PILOT_CHECKLIST.md`, `FINALISATION_10_STEPS.md`,
`STAGED_VOICE_INTEGRATION.md`, `CONTROLLED_GEMINI_CALL_RUNBOOK.md`,
`docs/voice/CANDIDATE_PIN_MANIFEST.md`,
`docs/voice/CLOUD_COST_EXIT_POLICY.md`, current voice/runtime source and targeted
regressions.
**Website mode:** PRE-LAUNCH

## Audit evidence at this checkpoint

- Python 3.13.15 targeted claims-control suite: **88 passed / 0 failed** across
  explicit-transfer, live-defect, voice-action, Gemini-provider, tenant-isolation,
  lifecycle, readiness and webhook-security tests.
- Broad Windows run excluding the two Linux-`resource` concurrency modules:
  **356 passed**; one POSIX file-mode assertion is not portable to NTFS and is not
  used to promote any website claim.
- Unfiltered Windows collection cannot execute the two Linux-only concurrency
  modules because Python's `resource` module is not available on Windows.
- Therefore this refresh does **not** promote concurrency, production hosting,
  carrier quality or production voice to VERIFIED.

## Hard gates

- **Commercially live / GA:** NOT AVAILABLE — never claim.
- **Controlled carrier voice on a canonical production/pilot runtime:**
  NOT AVAILABLE — **NO-GO**.
- **Present-fact marketing copy:** **VERIFIED rows only**.
- UNDER TEST / PLANNED / NOT AVAILABLE must not be stated as present commercial fact.
- A source-code capability is not the same thing as a proven live service.

## Taxonomy

| Status | Website use |
|---|---|
| **VERIFIED** | Present product/source fact only. Still PRE-LAUNCH; never imply public production service. |
| **UNDER TEST** | “Under testing / designed to” only — not GA or live proof. |
| **PLANNED** | Label as planned. |
| **NOT AVAILABLE** | Omit as a capability; may appear only in explicit “not claimed” language. |

---

# APPROVED FOR PRESENT-FACT COPY (VERIFIED ONLY)

| ID | Claim | Evidence |
|---|---|---|
| V-02 | UK terminology and 999 (never 911) emergency guidance exists in current product source and regressions | `gemini_voice.py`; README; FINALISATION step 6; targeted 2026-09-26 regression audit |
| V-03 | Receptionist source collects caller details for structured maintenance intake | README; current voice source; targeted regressions |
| V-04 | Explicit caller-request human transfer exists in source and regressions; ordinary technical failure must fail closed rather than auto-transfer | CURRENT_STATUS; `tests/test_explicit_transfer_only.py`; main hardening commits `11ed8ea…`, `7c3bf1b…` |
| V-05 | Assistant policy must not invent bookings, dispatches, refunds, compensation, account information or safety assurances | README; `gemini_voice.py`; `voice_policy.py`; `action_evidence.py`; targeted 2026-09-26 audit |
| V-06 | Historical real receptionist / validation calls have occurred in test/validation context only | README; CURRENT_STATUS; PILOT_CHECKLIST |
| O-01 | Multi-tenant maintenance-operations system exists in canonical source | README |
| O-02 | Tenant-scoped properties, residents, contractors, work orders, jobs, communications, exports, action evidence and call sessions exist in source | README; models/operations source |
| O-03 | Deterministic server rules own safety, lifecycle and approvals; AI does not override them | README; ARCHITECTURE; DECISION_BOOK |
| O-04 | Critical-safety latch requires authorised human clearance | ARCHITECTURE; lifecycle regressions |
| O-05 | RED cases can enter escalation / HUMAN_REVIEW | README; ARCHITECTURE; DECISION_BOOK |
| O-06 | Quote/invoice checks exist; **no** payment, refund, compensation, fee-waiver or client-money execution authority | README; DECISION_BOOK |
| O-07 | Streamlit supervisor dashboard exists as internal supervisor tooling | README; ARCHITECTURE |
| S-01 | Tenant-isolation controls exist in source | ARCHITECTURE; `tenant_security.py`; current targeted isolation tests |
| S-02 | Twilio HTTP/WSS signature-verification controls exist in source | README; webhook-security source/tests |
| S-03 | Audit events / action evidence exist; affirmative operational claims require verified success evidence | ARCHITECTURE; `action_evidence.py` |
| S-04 | Cloud CI and Security CI baseline historically passed on canonical application code | CURRENT_STATUS / FINALISATION step 2. This refresh does not turn later runner-policy commits into a fresh CI certification. |
| R-04 | Local acceptance was evidenced on 2026-09-10: full pytest pass, local-closed readiness and SQLite backup/restore | PILOT_CHECKLIST |
| R-06 | Current claims-control regressions passed at the exact 2026-09-26 product checkpoint | 88/88 targeted tests at `cc682c3e…` |

**Wording rule for VERIFIED:** state only that the capability/control exists in
MaintenanceOS. Do **not** imply a commercially live phone line, public production
access, current carrier quality, deployment readiness or general availability.

---

# NOT APPROVED AS PRESENT COMMERCIAL FACT

## UNDER TEST

| ID | Claim | Note |
|---|---|---|
| V-01 | Provider-aware AI voice receptionist runtime exists in canonical source | Voice intake remains under testing. Current commissioning spans the existing provider-aware runtime and a pinned local/self-hosted candidate. This is not a public always-on service. |
| V-10 | Live human-transfer answer / no-answer behaviour on carrier | Historical outcomes are mixed; fresh controlled carrier evidence remains required. |
| V-11 | Pinned local/self-hosted voice commissioning candidate | `docs/voice/CANDIDATE_PIN_MANIFEST.md` pins `CG-VOICE-0004` / Kokoro + local ASR/VAD/turn components for commissioning. The manifest explicitly says this is **not final production acceptance**. |
| R-02 / R-03 | Public / production hosting | Current product docs describe transitional voice infrastructure and require runtime re-verification. Do not market public production hosting from repository state alone. |
| F-01 | Public `/create` multi-step website→receptionist funnel | Funnel exists in the website repo. Early-access / preview only — not a live receptionist. |
| F-02 | SSRF-safe scan companion extracts company knowledge from a URL | PARTIAL / UNDER TEST. Flagged companion; off by default on public staging unless deliberately enabled and rebuilt. Do not claim live Fonio-parity knowledge crawl. |
| F-03 | Knowledge pack + system prompt from reviewed `/create` draft | PARTIAL. Missing fields stay missing. Not a live tenant / RAG knowledge base. |
| F-04 | Pack-aware scripted sandbox test call | PARTIAL. Scripted/browser-mock path only — **not** a live phone. |
| F-05 | Conversation quality vs Fonio | Scripted benchmark exists. It is not live-call barge-in/voice-quality parity. |

## PLANNED

| ID | Claim |
|---|---|
| R-05 | Production blockers still include governance, SSO/MFA, penetration testing, legal/privacy/telecoms review, monitoring/failover and other production controls documented by the product repo. |

## NOT AVAILABLE / FORBIDDEN AS A PRESENT CAPABILITY

| ID | Claim |
|---|---|
| V-07 | Controlled carrier call proven on the canonical current runtime — **NO-GO** until current runtime evidence passes |
| V-08 | Public production voice / Twilio media streaming proven on the canonical runtime |
| V-09 | Concurrent multi-line capacity numbers |
| O-08 | Public customer portal / account login / billing GA |
| O-09 | Live email / messaging / remote AI side effects as “live now” |
| R-01 | Commercial general availability / production customer-call pilot |
| S-05 | Certifications such as ISO or SOC 2 |
| S-06 | Fake uptime, customer logos, awards, ratings, reviews or testimonials |

---

## Website-specific guardrails

- Primary CTA may be **Create from website** (`/create/`).
- Join launch list / Request early demo remain secondary early-access conversions.
- Pricing stays request-pricing / launching-soon unless a separate commercial gate is approved.
- `/privacy`, `/cookies` and `/terms` remain DRAFT FOR LEGAL REVIEW.
- Website scan, knowledge pack, scripted sandbox, calendar and SAMPLE dashboard
  stay labelled honestly according to their flags/evidence.
- Do not advertise voice-provider brands as a customer promise. Voice architecture
  is still under commissioning and may change only through its own evidence gates.

## Signature

```text
SIGNED-BY: MOS Product Investigator
DATE: 2026-09-26
PRODUCT_REPO: chapelgate/maintenanceos-v1-pilot
PRODUCT_CHECKPOINT: cc682c3e5dc5a50e6d8ea695767b3e0f1f6f09c8
WEBSITE_PATH: PRODUCT_CLAIMS_REGISTER.md
PRESENT_FACT: VERIFIED rows only
COMMERCIALLY_LIVE: NO
CONTROLLED_CARRIER_VOICE: NO-GO
```
