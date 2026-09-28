# Form endpoint contract (v1)

**Status:** v1 — provider-independent  
**Consumers:** `src/lib/lead-adapter.ts`, `src/components/LeadCaptureForm.tsx`, `src/components/CreateReceptionistLaterSteps.tsx`  
**Local stub:** `scripts/form-stub-server.mjs` (`npm run form-stub`)

This marketing site is a **static export** (`output: 'export'` in `next.config.ts`). There are **no Next.js API routes**. Lead capture posts from the browser to the production Railway lead endpoint by default. `NEXT_PUBLIC_FORM_ENDPOINT` remains an explicit build-time override. The local stub remains available for isolated development and **must not claim that email was sent**.

Production hosting (DigitalOcean App Platform static) cannot run the local stub. The current production receiver is `https://rsfm-control-plane-production.up.railway.app/v1/public/website-leads`, reusing the existing Chapelgate RSFM control plane and audited Postgres store. `NEXT_PUBLIC_FORM_ENDPOINT` may override that absolute URL for controlled environments. The stub is for local development only and never sends mail.

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
| `message`        | no       | string    | Used on early demo/contact and the reviewed `/create` configuration; production receiver permits up to 64 KiB |
| `source_url`     | no       | string    | Current public page URL, used for operator context |
| `submission_id`  | no       | string    | Stable 8–128 character per-journey idempotency key; `/create` sends one |
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

`reference` identifies the durable stored request when the production receiver provides one. `confirmation_email: "accepted"` means the existing email provider accepted the visitor confirmation handoff; the client must not infer this from HTTP 2xx alone.

| `mode`         | Meaning | UI rule |
|----------------|---------|---------|
| `accepted`     | Lead durably accepted by the production receiver | Thank-you copy may say the request was recorded. Claim confirmation-email handoff only when `confirmation_email` explicitly equals `accepted`. |
| `queued_stub`  | Stored only by a stub/queue with no delivery | Thank-you copy must say **no email was sent**. |
| `submitted`    | **Deprecated alias** of `accepted` | Treat as `accepted`. Do not interpret as “email sent”. |

If the body is empty, non-JSON, or omits `mode`, the client treats HTTP 2xx as `accepted` and still **must not claim email was sent**.

The local stub always returns `"mode": "queued_stub"` and `"sends_email": false`.

## Error response

HTTP 4xx/5xx (or 200 with `"ok": false`):

```json
{
  "ok": false,
  "error": "Please enter a valid email address."
}
```

`error` is optional; FastAPI receivers may instead return a bounded string `detail`. The client falls back to a generic retry message. Do not include stack traces or secrets.

The production receiver records the lead **before** mail handoff. If it returns `503` with `detail: "lead recorded; customer confirmation is temporarily unavailable"` or `detail: "lead recorded; operator notification is temporarily unavailable"`, the client treats the request as accepted, keeps the success state on screen, and reports the delivery failure without asking the visitor to resubmit.

Suggested status codes:

| Status | When |
|--------|------|
| 400 | Invalid JSON, missing `email` / `lead_type`, malformed email |
| 404 | Unknown path |
| 405 | Method not allowed |
| 413 | Request exceeds the receiver body limit |
| 429 | Rate limited (recommended for production) |
| 500 | Unexpected failure |

## Email and claims

- The production endpoint persists the lead before requesting mail delivery through the existing Resend account.
- Operator notification and visitor confirmation are separate delivery handoffs. `/create` reports confirmation success only when the receiver returns `confirmation_email: "accepted"`.
- A mail failure after storage must never erase or disguise the durable request. The `/create` success state remains on screen and tells the visitor not to resubmit.
- Local/test stubs must not claim visitor email delivery unless they actually perform and report a provider handoff.
- The local stub logs JSON lines to disk and stdout only. It does not call SMTP, transactional APIs, or webhooks.

## Abuse controls (production)

Minimum expected of a real endpoint:

- Drop honeypot (`website`) silently with 2xx + `queued_stub` or equivalent discard.
- Keep public bodies bounded. The production `/create` message is capped at 64 KiB because it includes the reviewed blueprint, knowledge pack and protected prompt; smaller forms remain far below that.
- Rate-limit public submissions. The current production route uses a global bucket plus a privacy-preserving hashed-email bucket.
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

`GET /health` returns `{ "ok": true, "sends_email": false }`.


## Current production implementation

The current receiver is additive to the existing Chapelgate RSFM control plane. It does **not** write into the live telephony or work-order path.

- Origin allowlist: MaintenanceOS DigitalOcean marketing origin only.
- Storage: existing audited Postgres `rsfm_records`, `app_id=maintenanceos`, `kind=website.lead`.
- Spam: honeypot plus bounded public rate limits.
- Idempotency: duplicate retries reuse the same durable lead record.
- Operator follow-up: sending-only Resend credential restricted to the already-verified Chapelgate sending domain.
- Visitor acknowledgement: `/create` shows the durable reference when returned and reports confirmation-email provider handoff separately.
