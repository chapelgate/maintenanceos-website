# Onboarding flow — website URL → receptionist

**Target UX:** paste business website → scan → extract knowledge → create receptionist → voice ready → “CALL MY RECEPTIONIST” in about 60 seconds.  
**Honesty:** Fonio markets ~30s. We aim for ≤60s for a **sandbox** assistant; live number attach may take longer. Do not claim “live phone in 30s” until measured.

## Happy path (customer)

1. Land on marketing site with CTA: **Turn your business website into an AI receptionist**.
2. `/create` — enter business URL (+ optional email).
3. Progress UI: resolving → fetching → extracting → creating sandbox.
4. Review screen: name, greeting, services, FAQs, hours (edit inline).
5. Preview claims-safe knowledge pack + system prompt (edit inline). Missing fields stay missing.
6. Choose voice + language (UK English default).
7. Optional sandbox test — flagged; one-click pack-aware scripted demo when on. Not a live phone. A browser mock is demonstration-only. When a configured sandbox companion returns the exact reviewed pack/prompt and deterministic scripted transcript, Step 7 can record qualification for that exact review revision and advance `reviewed → sandbox_passed`.
8. Internal provisioning handoff — **not a browser step**. A trusted server-side caller may submit the complete reviewed/sandbox evidence to `packages/provisioning-gateway`; the gateway re-verifies Step 7, authenticates ownership, applies replay/idempotency controls and may advance only `sandbox_passed → provisioning`.
9. Connect calendar / number / go-live checklist — deferred to Steps 9–10. Calendar adapters exist in `packages/calendar-adapters` (flag default off; `/create` shows coming / under testing unless enabled locally). This is not a live phone booking/activation step.

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

## Receptionist draft (v0 implemented)

Library: `packages/receptionist-draft`. Contract: `docs/RECEPTIONIST_DRAFT_CONTRACT.md`. Pure function — no companion and no Next API route.

```
buildReceptionistDraft({ businessName, greeting, hours, services, faqs })
  → { knowledgePack, systemPrompt, limitations[] }
```

`/create` shows an editable preview after draft review. Missing hours/services stay omitted. The generated prompt must not claim a live number or always-on service. Sandbox `POST /v1/sandbox/sessions` stores the pack + prompt (or builds them from draft fields).

## Sandbox test (v0 implemented)

### Agent Factory Step 7 qualification

The existing sandbox remains the execution surface. Step 7 adds a fail-closed qualification policy around it; it does not create another sandbox service.

- only a complete Step-6 review revision can be qualified;
- browser mock results never award `sandbox_passed`;
- configured companion session must preserve the exact reviewed knowledge pack + protected prompt;
- scripted test/session IDs, no-live-call fields and transcript must match;
- edits invalidate previous qualification;
- qualification is pre-launch audit evidence, not production authorization or provisioning.


Companion: `packages/sandbox-test-call` (`npm run sandbox-test-call`). Contract: `docs/SANDBOX_TEST_CALL_CONTRACT.md`.

```
POST /v1/sandbox/sessions
  { businessName, greeting, hours, services, faqs, knowledgePack?, systemPrompt? }
  → { ok: true, liveCall: false, liveNumber: null, data: { id, kind: "sandbox", draft, knowledgePack, systemPrompt, limitations, … } }

GET /v1/sandbox/sessions/{id}

POST /v1/sandbox/sessions/{id}/test-call
  { "mode": "scripted" }
  → { ok: true, liveCall: false, data: { status: "scripted_demo_complete", turns: […] } }
  → { ok: false, error: "not_configured" }   // mode=webrtc
  → { ok: false, error: "live_call_forbidden" } // mode=live
```

`SANDBOX_TEST_CALL_ENABLED` defaults to **false**. Scripted turns read the stored session knowledge pack and follow the system prompt’s missing-field rule. This is not a live customer number.

## Secure provisioning gateway (Step 8 implemented)

Internal companion: `packages/provisioning-gateway` (`npm run provisioning-gateway`). Contract: `docs/PROVISIONING_GATEWAY_CONTRACT.md`.

- disabled by default;
- server-to-server only; browser Origin is rejected and there is no provisioning CORS surface;
- HMAC + timestamp + one-time nonce + idempotency key required;
- authenticated principal is tenant-scoped;
- only a schema-valid `sandbox_passed` AgentBlueprint is eligible;
- gateway recomputes the complete Step-7 review/session/test qualification and requires an exact match;
- accepted handoff creates a durable provisioning control record and changes lifecycle only to `provisioning`;
- it does **not** create/alter the frozen product database, attach a number, enable connectors, or activate an agent.

There is intentionally no `NEXT_PUBLIC_PROVISIONING_*` flag and no direct browser call from `/create`.

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

Local loopback demo (flags on for that process only): `docs/FONIO_LOCAL_E2E.md`. Staging HTTPS scan is a DigitalOcean droplet (`docs/ONBOARDING_SCAN_DEPLOY.md`). Do not apply `render.yaml`. Operator checklist (DigitalOcean env + rebuild + health order): `docs/STAGING_COMPANIONS.md`. Readiness / owner blocker: `docs/FONIO_WEBSITE_READINESS.md`. Not production Fonio-parity; leave flags off on DigitalOcean static hosting until the operator sets `NEXT_PUBLIC_*` and rebuilds.

## Claims-safe marketing copy

Allowed: “Preview how an AI receptionist could work for your site”, “Join launch list”, “Request early access”.  
Forbidden until verified: “Always-on live receptionist”, “Guaranteed 30-second live number”, fabricated integrations.
