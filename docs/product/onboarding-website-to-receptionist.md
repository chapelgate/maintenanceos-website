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
7. Connect calendar / number / go-live checklist (later steps; can defer).

## Failure modes (must handle)

| Failure | UX |
| --- | --- |
| Invalid URL / non-HTTPS | Inline validation |
| SSRF / private IP | Hard fail with safe message |
| Site blocked / timeout | Partial draft + manual paste |
| Thin content | Ask user to add FAQ / upload PDF |
| Extract low confidence | Highlight fields needing confirm |

## API sketch (onboarding service)

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
- `ONBOARDING_SANDBOX_CALL` — enable test call
- `ONBOARDING_PUBLIC` — show `/create` publicly (default off until QA)

## Claims-safe marketing copy

Allowed: “Preview how an AI receptionist could work for your site”, “Join launch list”, “Request early access”.  
Forbidden until verified: “Always-on live receptionist”, “Guaranteed 30-second live number”, fabricated integrations.
