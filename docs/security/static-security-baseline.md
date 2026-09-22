# Static security baseline (DigitalOcean App Platform)

**Status:** claims-safe baseline for the marketing `output: 'export'`  
**Code:** `src/lib/static-security-headers.ts`  
**Do not:** add `app.yaml` / `.do/`, `public/_headers`, Next.js `headers()`, a service component, spend, secrets, or telephony changes.

The site deploys as App Platform **static** (`out/` from `npm run build`, env in the Control Panel). This repo has no committed App Spec. Official static-site fields are output directory, catch-all/error documents, CORS, and env — **not** arbitrary response headers (`secure_header` is inbound-only).

`curl -I` on staging (`seahorse-app-4oasq.ondigitalocean.app`) shows Cloudflare/DO cache headers only. Do not claim `X-Frame-Options`, `X-Content-Type-Options`, or HTTP CSP are live.

## What is wired (exported HTML)

These ship in every page of the static export. Browsers honor them without a Node server:

| Control | How it is applied |
| --- | --- |
| Content-Security-Policy (enforcing) | `<meta http-equiv="Content-Security-Policy">` in the root layout |
| Referrer-Policy: `strict-origin-when-cross-origin` | Next metadata → `<meta name="referrer">` |

Production CSP (no `unsafe-eval`): first-party Next scripts/styles, self-hosted `next/font` Inter, the header Escape script, JSON-LD, `img-src 'self' data:`, `media-src 'self'` (product-tour mp4/vtt), `connect-src` / `form-action` for `https:` companions and `NEXT_PUBLIC_FORM_ENDPOINT`, plus loopback for local e2e. Report-only was not used — this policy is meant not to break `/create`.

`next dev` only adds `'unsafe-eval'` and `ws:` / `wss:` (HMR). That extra is not in the export.

## What this host cannot set

These need HTTP response headers. App Platform static cannot emit them today. They are **not** present, and meta tags for them are ignored (do not add theater tags):

| Header | Intended value |
| --- | --- |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Content-Security-Policy` (HTTP) | same as the meta policy, plus `frame-ancestors 'none'` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` |

`frame-ancestors` is ignored in HTML meta CSP, so clickjacking protection is an honest gap on this host.

Do **not** add `public/_headers` (not applied; would be a public file) or `headers()` in `next.config.ts` (incompatible with `output: 'export'`). Do **not** apply a new App Spec from git — that can overwrite the existing UI app.

## Verify after a DigitalOcean rebuild

1. View source on `/` and `/create/`: CSP `http-equiv` meta and `name="referrer"` are present.
2. `curl -sI https://<host>/` still omits `X-Frame-Options` / `X-Content-Type-Options` — expected.
3. `/create` still loads first-party JS/CSS/fonts; crawl/form `fetch` to an `https:` companion still works.

A runtime-only App Platform restart is not required for HTML-only tags (they ride the static files). A rebuild is required only because that is how `out/` is published.

This is a static-export baseline, not a WAF, not a certification, and not a live-telephony control.
