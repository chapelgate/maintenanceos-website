# Form endpoint contract (v1)

**Status:** v1 — provider-independent  
**Consumers:** `src/lib/lead-adapter.ts`, `src/components/LeadCaptureForm.tsx`, `src/components/CreateReceptionistLaterSteps.tsx`  
**Local stub:** `scripts/form-stub-server.mjs` (`npm run form-stub`)

This marketing site is a **static export** (`output: 'export'` in `next.config.ts`). There are **no Next.js API routes**. While `NEXT_PUBLIC_FORM_ENDPOINT` is empty, the public site does not post leads. Visitors use the mailto fallback. The retired Railway URL `https://rsfm-control-plane-production.up.railway.app/v1/public/website-leads` returns Application not found and must not be called. `NEXT_PUBLIC_FORM_ENDPOINT` remains an explicit build-time override for a later HTTPS receiver that meets this contract. The local stub remains available for isolated development and **must not claim that email was sent**.

Production hosting (DigitalOcean App Platform static) cannot run the local stub. A replacement receiver, if one is supplied, has to meet the storage and notification rules below. The retired host is not that receiver. The stub is for local development only and never sends mail.

## Lead types

Every conversion form uses `LeadCaptureForm` with one of:

| `lead_type`            | Page                         | Intent                          |
|------------------------|------------------------------|---------------------------------|
| `launch_list`          | `/` (`#join`), `/demo/#launch` | Join launch list                |
| `early_demo`           | `/demo/#demo`                | Request early access (human briefing — not a live phone) |
| `contact`              | `/contact/`                  | Human enquiry / early access (not a support desk) |
| `create_receptionist`  | `/create/`                   | Website→receptionist early access |

`create_receptionist` is captured by `CreateReceptionistForm` (not `LeadCaptureForm`). The `message` field should include the business URL and draft JSON. Do not invent additional types without updating `LeadType` in `src/config/site.ts`.

## Request

```
POST {siteConfig.formEndpoint}
Content-Type: application/json
Accept: application/json
```

The effective form endpoint must be an **absolute** `http:` or `https:` URL (production default above; local stub: `http://127.0.0.1:8787/leads`). Relative paths such as `/api/leads` are invalid on a static export.

### JSON body

| Field            | Required | Type      | Notes |
|------------------|----------|-----------|--------|
| `lead_type`      | yes      | string    | `launch_list` \| `early_demo` \| `contact` \| `create_receptionist` |
| `email`          | yes      | string    | Trimmed; basic `local@domain` shape |
| `name`           | no       | string    | Omitted if empty |
| `organisation`   | no       | string    | Omitted if empty |
| `role`           | no       | string    | Visitor-selected role slug |
| `message`        | no       | string    | Bounded configuration/lead payload; production receiver accepts up to 64,000 characters |
| `source_url`     | no       | string    | Current public page URL, used for operator context |
| `website`        | no       | string    | **Honeypot.** If present and non-empty, accept and discard. Do not tip off bots. |

The browser adapter does not send `website` when the honeypot is filled; it short-circuits locally. Endpoints should still treat a populated `website` field as spam.

Example:

```json
{
  "lead_type": "launch_list",
  "email": "alex@example.com",
  "name": "Alex Example",
  "organisation": "Example Lettings",
  "role": "letting_agent",
  "source_url": "https://seahorse-app-4oasq.ondigitalocean.app/contact/"
}
```

## CORS

The static site origin (local `http://localhost:3000` or the hosted marketing origin) is often different from the form endpoint. Endpoints **must** answer CORS:

| Header | Value |
|--------|--------|
| `Access-Control-Allow-Origin` | Request `Origin`, or a configured allowlist. `*` is acceptable for the local stub only. |
| `Access-Control-Allow-Methods` | `POST, OPTIONS` |
| `Access-Control-Allow-Headers` | `Content-Type, Accept` |
| `Access-Control-Max-Age` | optional, e.g. `86400` |

`OPTIONS` (preflight) must return **204** (or 200) with those headers and no body.

## Success response

HTTP **200**, **201**, or **202**. Body **should** be JSON:

```json
{
  "ok": true,
  "mode": "accepted",
  "reference": "durable-record-id",
  "confirmation_email": "accepted"
}
```

| `mode`         | Meaning | UI rule |
|----------------|---------|---------|
| `accepted`     | Lead stored by the production provider | Production UI requires a durable `reference`; `confirmation_email` is `"accepted"` or `"failed"` so a stored request is never discarded because mail handoff failed. |
| `queued_stub`  | Stored only by a stub/queue with no delivery | Thank-you copy must say **no email was sent**. |
| `submitted`    | **Deprecated alias** of `accepted` | Treat as `accepted`. Do not interpret as “email sent”. |

If the body is empty, non-JSON, or omits the receipt/confirmation fields, the adapter may parse HTTP 2xx as `accepted`, but production UI must show an incomplete-receipt error rather than a success claim.

The local stub always returns `"mode": "queued_stub"` and `"sends_email": false`.

## Error response

HTTP 4xx/5xx (or 200 with `"ok": false`):

```json
{
  "ok": false,
  "error": "Please enter a valid email address."
}
```

`error` is optional; the client falls back to a generic retry message. Do not include stack traces or secrets.

Suggested status codes:

| Status | When |
|--------|------|
| 400 | Invalid JSON, missing `email` / `lead_type`, malformed email |
| 404 | Unknown path |
| 405 | Method not allowed |
| 413 | Body larger than 32 KiB |
| 415 | Content-Type is not application/json |
| 429 | Rate limited (global per-origin bucket on the local stub; recommended for production) |
| 500 | Unexpected failure |

## Email and claims

- The production endpoint persists the lead before requesting an operator notification through the existing Resend account.
- It then requests a separate minimal customer acknowledgement to the submitted email address and stores its provider message ID/status on the same durable lead record.
- A durable production receipt requires `reference`. `confirmation_email: "accepted"` means the mail provider accepted the acknowledgement for delivery; `"failed"` means the request is still stored but the acknowledgement handoff failed. The UI must say this explicitly and must not ask the customer to resubmit a stored request.
- Retries reuse the client `submission_id` and must not intentionally resend operator/customer mail already marked sent.
- The local stub logs JSON lines to disk and stdout only. It does not call SMTP, transactional APIs, or webhooks.

## Abuse controls (production)

Minimum expected of a real endpoint:

- Drop honeypot (`website`) silently with 2xx + `queued_stub` or equivalent discard.
- Keep public lead bodies bounded. A production receiver should bound the configuration message (the retired receiver used 64,000 characters) and stay rate-limited.
- Rate-limit public submissions. The retired production route used a global bucket plus a privacy-preserving hashed-email bucket.
- Do not write leads into the product telephony / work-order systems (`WEBSITE_ARCHITECTURE.md`).

## Local stub

```bash
npm run form-stub
# default: http://127.0.0.1:8787/leads  (loopback only)

NEXT_PUBLIC_FORM_ENDPOINT=http://127.0.0.1:8787/leads npm run dev
```

| Env | Default | Purpose |
|-----|---------|---------|
| `FORM_STUB_HOST` | `127.0.0.1` | Bind address (keep loopback unless you intend otherwise) |
| `FORM_STUB_PORT` | `8787` | Listen port |
| `FORM_STUB_CORS_ORIGIN` | echo request `Origin`, else `*` | CORS allow origin |
| `FORM_STUB_DATA_FILE` | `.data/form-stub-leads.jsonl` | Append-only JSONL log (gitignored) |
| (built-in) | 10 POSTs / 60s per Origin+path | Local stub rate limit; returns 429 + Retry-After |

`GET /health` returns `{ "ok": true, "sends_email": false }`.


## Retired Railway implementation (not live)

The public path is email until an HTTPS endpoint that meets this contract is configured. The retired receiver was additive to the Chapelgate RSFM control plane. It does **not** write into the live telephony or work-order path. That host now returns Application not found. Do not call it.

Historical notes from that receiver, not a claim that a store is live today:

- Origin allowlist: MaintenanceOS DigitalOcean marketing origin only.
- Storage: existing audited Postgres `rsfm_records`, `app_id=maintenanceos`, `kind=website.lead`.
- Spam: honeypot plus bounded public rate limits.
- Idempotency: duplicate retries reuse the same durable lead record.
- Operator follow-up: sending-only Resend credential restricted to the already-verified Chapelgate sending domain.
- Visitor acknowledgement: a minimal confirmation email is requested after durable storage; the browser receives the durable reference and provider-acceptance status.
