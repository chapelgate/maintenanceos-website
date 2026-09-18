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
