# PRODUCT_CLAIMS_REGISTER.md (seed — MaintenanceOS Website)

Source of truth: `chapelgate/maintenanceos-v1-pilot` (CURRENT_STATUS.md dated 2026-09-14, README, ARCHITECTURE, open issues #9 #26 #31).

Website mode: **PRE-LAUNCH** (`PUBLIC_LAUNCH=false`). Do NOT claim commercially live, generally available, certified, or production call-ready.

## Claim taxonomy

- VERIFIED NOW — may state as present fact on website
- IMPLEMENTED BUT NOT RELEASE-VERIFIED — describe carefully as built/under test; not as GA
- PLANNED — upcoming/planned only if mentioned
- NOT AVAILABLE — do not claim

---

### AI receptionist / voice handling
| Claim | Status | Evidence | Approved for website? |
|---|---|---|---|
| AI-powered receptionist capability exists in product source | IMPLEMENTED BUT NOT RELEASE-VERIFIED | README: Gemini Live primary `VOICE_PROVIDER=gemini`; OpenAI Realtime optional fallback | Yes — as capability under testing / in development, not as live commercial service |
| UK terminology and 999 emergency guidance in source | VERIFIED NOW (in source + regression tests) | README; issue #9; tests lock UK/999/never-911 | Yes — as designed product behaviour; note live-carrier retest still required for corrected accent/emergency wording |
| Collects caller details | VERIFIED NOW (product design/source) | README receptionist collects caller details | Yes |
| Explicit human transfer supported in source | VERIFIED NOW (source + CI) | PR #25 merged; explicit-request-only transfer | Yes — callers can request a human; transfer quality still under retest |
| Must not invent bookings/dispatches/refunds/compensation/account/safety assurances | VERIFIED NOW | README product controls | Yes — trust section |
| Real receptionist calls have occurred historically | VERIFIED NOW | README; CURRENT_STATUS; issue #9 | Yes — carefully: prior test/validation calls, NOT commercial GA |
| Controlled Gemini call on current DigitalOcean deployment | NOT AVAILABLE / blocked | CURRENT_STATUS: controlled Gemini call NOT yet authorised on DO runtime; realtime voice false on /health | No as “live now”; may say further controlled testing underway |
| Concurrent multi-line production scale | PLANNED / NOT RELEASE-VERIFIED | Architecture mentions concurrency controls for consequential work; no verified “handles N simultaneous calls” | Website: architecture being developed / designed for concurrent operations — NEVER invent numbers |

### Maintenance operations / triage
| Claim | Status | Evidence | Approved? |
|---|---|---|---|
| Multi-tenant maintenance-operations system | VERIFIED NOW (source) | README | Yes |
| Work orders, properties, residents, contractors, jobs, communications | VERIFIED NOW (source) | README implemented controls | Yes as product capabilities under testing |
| Deterministic safety/lifecycle rules override AI | VERIFIED NOW | README; ARCHITECTURE trust boundaries | Yes — core differentiator |
| Critical safety latch requiring human clearance | VERIFIED NOW | ARCHITECTURE critical-safety invariant | Yes |
| Escalation queues / human review | VERIFIED NOW | README; ARCHITECTURE | Yes |
| Quotes/invoices checks exist; no payment/refund authority | VERIFIED NOW | README: no payment/refund/compensation/fee-waiver/client-money execution | Yes — do not claim payments processing |
| Streamlit supervisor dashboard | VERIFIED NOW (source) | README | Yes as internal supervisor tooling — not as public customer portal GA |
| Customer portal / public account login | PLANNED / NOT AVAILABLE as GA | Future integration points only | Scaffold links only; no fake portal |

### Security / trust
| Claim | Status | Evidence | Approved? |
|---|---|---|---|
| Tenant isolation | VERIFIED NOW (source) | ARCHITECTURE tenant_security | Yes |
| Twilio HTTP/WSS signature verification in source | VERIFIED NOW (source) | README | Yes as design; live verification still in checklist |
| Audit events / action evidence | VERIFIED NOW | ARCHITECTURE action_evidence | Yes |
| Certifications (ISO, SOC2, etc.) | NOT AVAILABLE | No evidence | Never invent |
| Fake uptime stats / customer logos / awards | NOT AVAILABLE | — | Forbidden |

### Release readiness
| Claim | Status | Evidence | Approved? |
|---|---|---|---|
| Commercially generally available | NOT AVAILABLE | CURRENT_STATUS; issues #9 #26 #31 open | NO — PRE-LAUNCH only |
| Production customer call pilot authorised | NOT AVAILABLE | Issue #26 gate incomplete | NO |
| DigitalOcean deployment exists (loopback API) | VERIFIED NOW | CURRENT_STATUS droplet chapelgate-maintenanceos-production | Internal only — do not publish IPs/hosts on marketing site |
| Cloud CI / Security CI passing on main | VERIFIED NOW | CURRENT_STATUS; issue #9 | Soft trust wording only if needed; no overclaim |

## Required website wording patterns
- Primary CTA: Join launch list / Request early demo
- Pricing: Request pricing / Pricing launching soon (config-driven)
- Features: “designed to…”, “under testing…”, “built to…” where UNDER TEST
- Never: “available now”, “handles 100 concurrent calls”, fake reviews

## Future integration stubs (do not fake backends)
account login, dashboard, onboarding, demo env, customer portal, docs, API docs, billing, status page
