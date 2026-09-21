# Sandbox test-call contract (v0)

**Status:** v0 — flagged companion for ReceptionistOS + optional `/create` panel  
**Consumers:** `src/lib/sandbox-test-call.ts`, `src/components/SandboxTestCallPanel.tsx`  
**Implementation:** `packages/sandbox-test-call` (`npm run sandbox-test-call`)

This marketing site is a **static export** (`output: 'export'`). There are **no Next.js API routes**. `/create` talks to `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT` only when that value is an absolute `http:` or `https:` URL **and** `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED` is `true`/`1`. If the public flag is off, the UI says sandbox test call is under testing / coming and **must not** claim a live phone call.

## Hard limits

- Not a live customer phone number.
- Not production telephony.
- Frozen live voice path (Render `maintenanceos-redteam-v2` or similar) is **untouched**.
- No production Twilio number provisioning.
- `ok: true` is only a **scripted** or **browser-mock** demo. Never invent `liveCall: true`.

## Base URL

Default local base: `http://127.0.0.1:8790/v1/sandbox`.

The client appends `/sessions` and `/sessions/{id}/test-call`.

## Create session

```
POST {BASE}/sessions
Content-Type: application/json
```

```json
{
  "businessName": "Acme Plumbing",
  "greeting": "Warm homes, honest quotes",
  "hours": "Mon–Fri 08:00–17:00",
  "services": "Boiler repair",
  "faqs": "Q: Do you cover London?\nA: Yes, within the M25.",
  "knowledgePack": { "untrusted": true, "kind": "sandbox_knowledge_pack", "liveCall": false, "liveNumber": null, "alwaysOn": false, "productionTelephony": false, "businessName": "Acme Plumbing", "missing": ["greeting"] },
  "systemPrompt": "…"
}
```

HTTP **200**:

```json
{
  "ok": true,
  "liveCall": false,
  "liveNumber": null,
  "productionTelephony": false,
  "data": {
    "id": "sandbox_sess_1",
    "kind": "sandbox",
    "status": "ready",
    "draft": {
      "businessName": "Acme Plumbing",
      "greeting": "Warm homes, honest quotes",
      "hours": "Mon–Fri 08:00–17:00",
      "services": "Boiler repair",
      "faqs": "Q: Do you cover London?\nA: Yes, within the M25."
    },
    "createdAt": "2026-09-20T12:00:00.000Z",
    "liveCall": false,
    "liveNumber": null,
    "productionTelephony": false,
    "frozenLivePathUntouched": true
  }
}
```

Missing draft keys stay empty strings. The service must not invent greeting, hours, services, or FAQs. Optional `knowledgePack` / `systemPrompt` are stored after claims-safe normalisation (`packages/receptionist-draft`). If omitted, they are built from the draft fields. `liveCall` stays false. See `docs/RECEPTIONIST_DRAFT_CONTRACT.md`.

## Describe session

```
GET {BASE}/sessions/{id}
```

HTTP **200** with the same session object, or **404** `session_not_found`.

## Start sandbox test

```
POST {BASE}/sessions/{id}/test-call
```

```json
{ "mode": "scripted" }
```

| `mode` | Result |
| --- | --- |
| omitted / `scripted` / `browser_mock` | HTTP **200** + `status: "scripted_demo_complete"` and a transcript. `liveCall` is **false**. |
| `webrtc` | HTTP **503** `{ "ok": false, "error": "not_configured" }` — live media is not configured. |
| `live` / `production` / `twilio` | HTTP **403** `{ "ok": false, "error": "live_call_forbidden" }` |

HTTP **200** example:

```json
{
  "ok": true,
  "liveCall": false,
  "liveNumber": null,
  "productionTelephony": false,
  "data": {
    "id": "sandbox_test_1",
    "sessionId": "sandbox_sess_1",
    "mode": "scripted",
    "status": "scripted_demo_complete",
    "turns": [
      { "speaker": "receptionist", "text": "Warm homes, honest quotes", "source": "draft.greeting" }
    ],
    "liveCall": false,
    "liveNumber": null,
    "productionTelephony": false,
    "frozenLivePathUntouched": true
  }
}
```

The client must ignore any payload that sets `liveCall: true` or includes a `liveNumber`. Treat that as failure — do not display “call connected”.

## Errors

```json
{ "ok": false, "error": "sandbox_disabled", "message": "…", "liveCall": false, "liveNumber": null, "productionTelephony": false }
```

| Status | `error` | When |
| --- | --- | --- |
| 400 | `invalid_request` | Missing session id or unknown mode |
| 403 | `live_call_forbidden` | Caller asked for live / production / Twilio |
| 404 | `session_not_found` | Unknown id |
| 413 | `payload_too_large` | Body larger than 16 KiB |
| 429 | `rate_limited` | More than 20 POSTs / minute / IP |
| 503 | `sandbox_disabled` | `SANDBOX_TEST_CALL_ENABLED` is not `true`/`1` (and alias off) |
| 503 | `not_configured` | WebRTC / live media requested but not available |

## CORS

Same expectation as `docs/FORM_ENDPOINT_CONTRACT.md`: `OPTIONS` → 204; allow `GET, POST, OPTIONS` and `Content-Type, Accept`.

Staging `/create` is cross-origin (DigitalOcean static → Render companion). Unset `SANDBOX_TEST_CALL_CORS_ORIGIN` echoes the browser `Origin` so `https://seahorse-app-4oasq.ondigitalocean.app` and a chapelgate custom origin both work. A single configured origin locks to that origin only. Details: `docs/SANDBOX_DEPLOY.md`.

## Feature flags

- `SANDBOX_TEST_CALL_ENABLED=false` (default) — companion may listen for `/health`, but mutations are off.
- `ONBOARDING_SANDBOX_CALL` — alias for the companion master switch.
- Marketing `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED` and `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT` — empty / false on DigitalOcean static by default. To point staging `/create` at a hosted companion, set the absolute `https://…/v1/sandbox` URL and the public flag on App Platform and **rebuild** (static export inlines `NEXT_PUBLIC_*`). Runbook: `docs/SANDBOX_DEPLOY.md`.
- If the public flag is on and the endpoint is empty, `/create` uses an in-browser scripted stub. That stub still returns `not_configured` / `live_call_forbidden` for live media.

## Claims

- Implementing this contract means creating a **sandbox session** and optionally a **scripted demo transcript**.
- Never claim a live customer number, always-on receptionist, or Fonio-parity voice quality from this endpoint.
