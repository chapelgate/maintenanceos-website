# Form endpoint contract (v1)

**Status:** v1 — provider-independent  
**Consumers:** `src/lib/lead-adapter.ts`, `src/components/LeadCaptureForm.tsx`, `src/components/CreateReceptionistForm.tsx`  
**Local stub:** `scripts/form-stub-server.mjs` (`npm run form-stub`)

This marketing site is a **static export** (`output: 'export'` in `next.config.ts`). There are **no Next.js API routes**. Lead capture posts from the browser to `NEXT_PUBLIC_FORM_ENDPOINT`. If that variable is empty, the client returns a local success stub and **must not claim that email was sent**.

Production hosting (for example DigitalOcean App Platform static) cannot run the local stub. Point `NEXT_PUBLIC_FORM_ENDPOINT` at any service that implements this contract (Formspree, a Cloudflare Worker, a DigitalOcean Function, etc.). The stub is for local development only and never sends mail.

## Lead types

Every conversion form uses `LeadCaptureForm` with one of:

| `lead_type`            | Page                         | Intent                          |
|------------------------|------------------------------|---------------------------------|
| `launch_list`          | `/` (`#join`), `/demo/#launch` | Join launch list                |
| `early_demo`           | `/demo/#demo`                | Request early access (human briefing — not a live phone) |
| `contact`              | `/contact/`                  | General enquiry                 |
| `create_receptionist`  | `/create/`                   | Website→receptionist early access |

`create_receptionist` is captured by `CreateReceptionistForm` (not `LeadCaptureForm`). The `message` field should include the business URL and draft JSON. Do not invent additional types without updating `LeadType` in `src/config/site.ts`.

## Request

```
POST {NEXT_PUBLIC_FORM_ENDPOINT}
Content-Type: application/json
Accept: application/json
```

`NEXT_PUBLIC_FORM_ENDPOINT` must be an **absolute** `http:` or `https:` URL (for local stub: `http://127.0.0.1:8787/leads`). Relative paths such as `/api/leads` are invalid on a static export.

### JSON body

| Field            | Required | Type      | Notes |
|------------------|----------|-----------|--------|
| `lead_type`      | yes      | string    | `launch_list` \| `early_demo` \| `contact` \| `create_receptionist` |
| `email`          | yes      | string    | Trimmed; basic `local@domain` shape |
| `name`           | no       | string    | Omitted if empty |
| `organisation`   | no       | string    | Omitted if empty |
| `role`           | no       | string    | Visitor-selected role slug |
| `message`        | no       | string    | Used on early demo and contact |
| `source`         | no       | string    | Client sends `maintenanceos-website` |
| `public_launch`  | no       | boolean   | Current `PUBLIC_LAUNCH` flag |
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
  "source": "maintenanceos-website",
  "public_launch": false
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
  "mode": "accepted"
}
```

| `mode`         | Meaning | UI rule |
|----------------|---------|---------|
| `accepted`     | Lead stored or queued by a real provider | Thank-you copy may say the request was accepted. **Never** say a confirmation or notification email was sent. |
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

`error` is optional; the client falls back to a generic retry message. Do not include stack traces or secrets.

Suggested status codes:

| Status | When |
|--------|------|
| 400 | Invalid JSON, missing `email` / `lead_type`, malformed email |
| 404 | Unknown path |
| 405 | Method not allowed |
| 413 | Body larger than 32 KiB |
| 429 | Rate limited (recommended for production) |
| 500 | Unexpected failure |

## Email and claims

- Implementing this contract means **accepting a JSON lead**, not sending mail.
- Outbound / confirmation email is **out of scope** unless a separately reviewed mailer is configured later.
- Client success states (`LeadCaptureForm`) must **never** claim that email was sent, including when `mode` is `accepted`.
- The local stub logs JSON lines to disk and stdout only. It does not call SMTP, transactional APIs, or webhooks.

## Abuse controls (production)

Minimum expected of a real endpoint:

- Drop honeypot (`website`) silently with 2xx + `queued_stub` or equivalent discard.
- Cap body size (32 KiB is enough).
- Rate-limit by IP.
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
