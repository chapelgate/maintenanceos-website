# Onboarding flow — website URL → receptionist

**Target UX:** paste business website → scan → extract knowledge → create receptionist → voice ready → “CALL MY RECEPTIONIST” in about 60 seconds.  
**Honesty:** Fonio markets ~30s. We aim for ≤60s for a **sandbox** assistant; live number attach may take longer. Do not claim “live phone in 30s” until measured.

## Happy path (customer)

1. Land on marketing site with CTA: **Turn your business website into an AI receptionist**.
2. `/create` — enter business URL (+ optional email).
3. Progress UI: resolving → fetching → extracting → creating sandbox.
4. Review screen: name, greeting, services, FAQs, hours (edit inline).
5. Choose voice + language (UK English default).
6. **Call my receptionist** — sandbox test (feature-flagged; not fake).
7. Connect calendar / number / go-live checklist — calendar adapters exist in `packages/calendar-adapters` (flag default off; `/create` shows coming / under testing unless enabled locally). Not a live phone booking step.

## Failure modes (must handle)

| Failure | UX |
| --- | --- |
| Invalid URL / non-HTTPS | Inline validation |
| SSRF / private IP | Hard fail with safe message |
| Site blocked / timeout | Partial draft + manual paste |
| Thin content | Ask user to add FAQ / upload PDF |
| Extract low confidence | Highlight fields needing confirm |

## API (v0 implemented for `/create`)

The marketing client is **synchronous**. Companion service: `packages/onboarding-ingest` (`npm run onboarding-scan`). Contract: `docs/ONBOARDING_SCAN_CONTRACT.md`.

```
POST /v1/onboarding/scan
  { "url": "https://example.com" }
  → { "ok": true, "untrusted": true, "draft": { businessName, greeting, hours, services, faqs }, "warnings": [] }
  → { "ok": false, "error": "non_public_host|scan_disabled|fetch_failed|…", "message": "…", "warnings": [] }
```

`ONBOARDING_WEB_INGEST` defaults to **false**. HTTPS + SSRF (DNS and redirect re-check) are enforced. Missing draft keys are omitted, never invented.

## Sandbox test (v0 implemented)

Companion: `packages/sandbox-test-call` (`npm run sandbox-test-call`). Contract: `docs/SANDBOX_TEST_CALL_CONTRACT.md`.

```
POST /v1/sandbox/sessions
  { businessName, greeting, hours, services, faqs }
  → { ok: true, liveCall: false, liveNumber: null, data: { id, kind: "sandbox", draft, … } }

GET /v1/sandbox/sessions/{id}

POST /v1/sandbox/sessions/{id}/test-call
  { "mode": "scripted" }
  → { ok: true, liveCall: false, data: { status: "scripted_demo_complete", turns: […] } }
  → { ok: false, error: "not_configured" }   // mode=webrtc
  → { ok: false, error: "live_call_forbidden" } // mode=live
```

`SANDBOX_TEST_CALL_ENABLED` defaults to **false**. This is not a live customer number.

## Later API (sandbox promote — not implemented)

```
POST /v1/onboarding/scan
  { "url": "https://example.com", "email?": "..." }
  → { "jobId": "..." }

GET /v1/onboarding/jobs/{jobId}
  → { "status": "running|ready|failed", "draft": {...}, "warnings": [] }

POST /v1/onboarding/jobs/{jobId}/promote
  { "confirmations": [...] }
  → { "tenantId", "assistantId", "sandboxReady": true }
```

## Feature flags

- `ONBOARDING_WEB_INGEST` — enable crawl
- `ONBOARDING_SANDBOX_CALL` — alias for sandbox test-call companion (default off)
- `SANDBOX_TEST_CALL_ENABLED` — enable sandbox session + scripted test companion (default off)
- `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED` — show `/create` sandbox controls (default off)
- `ONBOARDING_PUBLIC` — show `/create` publicly (default off until QA)
- `CALENDAR_ADAPTERS_ENABLED` — enable calendar companion (default off)
- `NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED` — show `/create` slot picker (default off)
- `CUSTOMER_DASHBOARD_ENABLED` — enable dashboard companion (default off)
- `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED` — show `/dashboard` SAMPLE store (default off)

## Claims-safe marketing copy

Allowed: “Preview how an AI receptionist could work for your site”, “Join launch list”, “Request early access”.  
Forbidden until verified: “Always-on live receptionist”, “Guaranteed 30-second live number”, fabricated integrations.
