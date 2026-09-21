# Onboarding scan contract (v0)

**Status:** v0 — companion service for the static `/create` funnel  
**Consumers:** `src/lib/onboarding-create.ts`, `src/components/CreateReceptionistForm.tsx`  
**Implementation:** `packages/onboarding-ingest` (`npm run onboarding-scan`)

This marketing site is a **static export** (`output: 'export'`). There are **no Next.js API routes**. `/create` posts from the browser to `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` when that value is an absolute `http:` or `https:` URL. If the variable is empty, the client queues crawl honestly and **must not invent** extracted content.

## Request

```
POST {NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT}
Content-Type: application/json
Accept: application/json
```

Default local path: `http://127.0.0.1:8788/v1/onboarding/scan`.

```json
{ "url": "https://www.example.com/" }
```

| Field | Required | Notes |
| --- | --- | --- |
| `url` | yes | Public **https** business website. `http`, userinfo, localhost, private/reserved IPs, and metadata hosts are rejected. |

Optional `email` is ignored by v0 (the client does not send it).

## Success response

HTTP **200**:

```json
{
  "ok": true,
  "untrusted": true,
  "draft": {
    "businessName": "Acme Plumbing",
    "greeting": "Warm homes, honest quotes",
    "hours": "Mo-Fr 08:00-17:00",
    "services": "Boiler repair\nEmergency leak stop",
    "faqs": "Q: Do you cover London?\nA: Yes, within the M25."
  },
  "warnings": ["untrusted_crawl_text"],
  "sources": [{ "url": "https://acme.example/", "status": 200, "bytes": 1234 }]
}
```

The client maps **only** `businessName`, `greeting`, `hours`, `services`, `faqs` when they are non-empty strings. Fields may sit on the root or under `draft`. Unknown keys are ignored. Omit a field instead of guessing.

`untrusted: true` means every extracted string is page data, never system instructions.

## Error response

```json
{
  "ok": false,
  "error": "non_public_host",
  "message": "This URL is not a public website and will not be fetched.",
  "warnings": ["ssrf_denied"]
}
```

| Status | `error` | When |
| --- | --- | --- |
| 400 | `invalid_url` / `http_not_allowed` / `non_public_host` / `non_public_resolved_ip` | Bad or SSRF-unsafe URL (including after DNS/redirect) |
| 413 | — | Body larger than 8 KiB |
| 429 | `rate_limited` | More than 20 POSTs / minute / IP |
| 503 | `scan_disabled` | `ONBOARDING_WEB_INGEST` is not `true`/`1` |
| 422 | `fetch_failed` / `robots_disallow` / … | Public URL but no usable pages; **no invented draft** |
| 504 | `timeout` | Time budget exceeded before any page |

The client treats any non-OK HTTP status as `scan_failed` and does not invent fields.

## CORS

Same expectation as `docs/FORM_ENDPOINT_CONTRACT.md`: `OPTIONS` → 204; allow `POST, OPTIONS` and `Content-Type, Accept`.

Staging `/create` is cross-origin (DigitalOcean static → Render companion). Unset `ONBOARDING_SCAN_CORS_ORIGIN` echoes the browser `Origin` so `https://seahorse-app-4oasq.ondigitalocean.app` and a chapelgate custom origin both work. A single configured origin locks to that origin only. Details: `docs/ONBOARDING_SCAN_DEPLOY.md`.

## Feature flags

- `ONBOARDING_WEB_INGEST=false` (default) — service may listen for `/health`, but scan is off.
- `ONBOARDING_SANDBOX_CALL` — unused by this scan service (health still reports `sandboxCall: false`). Sandbox test-call is `packages/sandbox-test-call` (`SANDBOX_TEST_CALL_ENABLED`; this name is accepted there as an alias).
- Marketing `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` — empty on DigitalOcean static by default. To point staging `/create` at a hosted companion, set the absolute `https://…/v1/onboarding/scan` URL on App Platform and **rebuild** (static export inlines `NEXT_PUBLIC_*`). Runbook: `docs/ONBOARDING_SCAN_DEPLOY.md`.

## Claims

- Implementing this contract means **extracting a reviewable draft** from public pages, not creating a receptionist or phone number.
- Never claim live telephony, “call my receptionist”, or guaranteed 30-second provisioning from this endpoint.
