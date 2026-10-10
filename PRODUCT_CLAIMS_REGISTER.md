# PRODUCT_CLAIMS_REGISTER.md — SIGNED (VERIFIED-ONLY APPROVAL)

**Signer:** MOS Product Investigator
**Signed:** 2026-09-30
**Product source:** `chapelgate/maintenanceos-v1-pilot` (`main`)
**Product checkpoint:** `498ad82dd87631814195d447d89458480b117951`
**Current product status reviewed:** `MASTER_PROBLEM_LOG.md` and `HUMAN_BLOCKERS.md`
through 2026-09-30. `CURRENT_STATUS.md` is retained as historical context but is
older than the current live voice incident evidence.
**Also reviewed:** `README.md`, `ARCHITECTURE.md`, `DECISION_BOOK.md`,
`PILOT_CHECKLIST.md`, `FINALISATION_10_STEPS.md`,
`STAGED_VOICE_INTEGRATION.md`, `CONTROLLED_GEMINI_CALL_RUNBOOK.md`,
`docs/voice/CANDIDATE_PIN_MANIFEST.md`,
`docs/voice/CLOUD_COST_EXIT_POLICY.md`, current voice/runtime source and targeted
regressions.
**Website mode:** PRE-LAUNCH

## Audit evidence at this checkpoint

- Current product `main` is **30 commits ahead** of the prior website claims
  checkpoint. The changed claim-bearing areas are concentrated in voice turn
  recovery, provider adapters/webhooks and call notifications; deterministic
  maintenance controls were rechecked rather than assumed.
- Python 3.13 targeted claims/safety suite on exact product SHA
  `498ad82dd87631814195d447d89458480b117951`: **196 passed / 0 failed** across
  explicit transfer, live-defect regression, voice-action claims, Gemini provider
  and voice policy, provider adapter/webhook contracts, webhook security,
  tenant isolation, lifecycle integrity, readiness profiles, decision rules,
  invoice rules, state-machine controls and local acceptance.
- Current product evidence records a real Gemini call that greeted, then stalled
  after caller speech on the accepted live host. A narrow stalled-turn hotfix is
  independently verified but **not deployed** because the accepted host currently
  lacks an authorised non-destructive deployment identity.
- Therefore this refresh does **not** promote concurrency, production hosting,
  carrier quality, current live voice quality or production voice to VERIFIED.

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
| V-02 | UK terminology and 999 (never 911) emergency guidance exists in current product source and regressions | `gemini_voice.py`; README; FINALISATION step 6; targeted 2026-09-30 regression audit |
| V-03 | Receptionist source collects caller details for structured maintenance intake | README; current voice source; targeted regressions |
| V-04 | Explicit caller-request human transfer exists in source and regressions; ordinary technical failure must fail closed rather than auto-transfer | CURRENT_STATUS; `tests/test_explicit_transfer_only.py`; main hardening commits `11ed8ea…`, `7c3bf1b…` |
| V-05 | Assistant policy must not invent bookings, dispatches, refunds, compensation, account information or safety assurances | README; `gemini_voice.py`; `voice_policy.py`; `action_evidence.py`; targeted 2026-09-30 audit |
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
| R-06 | Current claims-control regressions passed at the exact 2026-09-30 product checkpoint | 196/196 targeted tests at `498ad82d…` |

**Wording rule for VERIFIED:** state only that the capability/control exists in
MaintenanceOS. Do **not** imply a commercially live phone line, public production
access, current carrier quality, deployment readiness or general availability.

---

# NOT APPROVED AS PRESENT COMMERCIAL FACT

## UNDER TEST

| ID | Claim | Note |
|---|---|---|
| V-01 | Provider-aware AI voice receptionist runtime exists in canonical source | Voice intake remains under testing. The accepted live Gemini/Gacrux host currently has a documented greet-then-stall defect after caller speech; the verified stalled-turn hotfix is frozen but not deployed. This is not a public always-on service. |
| V-10 | Live human-transfer answer / no-answer behaviour on carrier | Historical outcomes are mixed; fresh controlled carrier evidence remains required. |
| V-11 | Pinned local/self-hosted voice commissioning candidate | `docs/voice/CANDIDATE_PIN_MANIFEST.md` pins `CG-VOICE-0004` / Kokoro + local ASR/VAD/turn components for commissioning. The manifest explicitly says this is **not final production acceptance**. |
| R-02 / R-03 | Public / production hosting | The accepted voice host is identifiable and healthy at the HTTP layer, but current real-call turn recovery is not accepted. Repository state and a verified undeployed hotfix do not prove a production-ready public voice service. |
| F-01 | Public `/create` multi-step website→receptionist funnel | Funnel exists in the website repo. Early-access / preview only — not a live receptionist. |
| F-02 | SSRF-safe scan companion package exists in source | NON-PUBLIC / RETIRED FROM THE CURRENT WEBSITE PATH. The public `/create` client is source-pinned to the no-crawl review fallback and the paid provider component has been removed. Do not claim a live website knowledge crawl. |
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

- Primary CTA is **Request an early demo** (`/demo/`), on Andy Cartwright's decision of 10 Oct 2026.
- **Create from website** and **Join launch list** become secondary early-access conversions.
- Pricing stays request-pricing / launching-soon unless a separate commercial gate is approved.
- `/privacy`, `/cookies` and `/terms` remain DRAFT FOR LEGAL REVIEW.
- Website-address setup, knowledge pack, scripted sandbox, calendar and SAMPLE
  dashboard stay labelled honestly according to their evidence. Public website
  crawl is retired from the current /create path and must not be presented as available.
- Do not advertise voice-provider brands as a customer promise. Voice architecture
  is still under commissioning and may change only through its own evidence gates.

## Signature

```text
SIGNED-BY: MOS Product Investigator
DATE: 2026-09-30
PRODUCT_REPO: chapelgate/maintenanceos-v1-pilot
PRODUCT_CHECKPOINT: 498ad82dd87631814195d447d89458480b117951
WEBSITE_PATH: PRODUCT_CLAIMS_REGISTER.md
PRESENT_FACT: VERIFIED rows only
COMMERCIALLY_LIVE: NO
CONTROLLED_CARRIER_VOICE: NO-GO
```
