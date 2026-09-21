# onboarding-ingest

Feature-flagged, SSRF-safe website → receptionist **draft** scan for ReceptionistOS / MaintenanceOS.

This is a **standalone Node service**, not a Next.js API route. The marketing site stays `output: 'export'` on DigitalOcean static hosting. `/create` calls this service only when `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` is an absolute `http(s)` URL.

**Status:** local / staging companion. Off by default. Not wired to production telephony. Crawl text is **untrusted data** and must never be concatenated into a system prompt.

## What `/create` already expects

The marketing client (`src/lib/onboarding-create.ts`) POSTs `{ "url": "https://…" }` and maps **only** these string fields, from the JSON root or a `draft` object:

| Field | Meaning |
| --- | --- |
| `businessName` | Visible business name |
| `greeting` | Only if the site itself states a slogan/tagline |
| `hours` | Opening hours found on the pages |
| `services` | Services found on the pages |
| `faqs` | FAQ pairs found on the pages |

Missing keys are left empty. The client **does not invent** crawl results. If this endpoint is unset, `/create` says the crawl is queued and may seed `businessName` from the hostname only.

## Flags

| Env | Default | Purpose |
| --- | --- | --- |
| `ONBOARDING_WEB_INGEST` | `false` | Master switch. When not `true`/`1`, `POST /v1/onboarding/scan` returns `503 scan_disabled` and does not fetch. |
| `ONBOARDING_SANDBOX_CALL` | `false` | Unused here. Health reports `sandboxCall: false`. Sandbox test-call is `packages/sandbox-test-call`. |
| `ONBOARDING_SCAN_HOST` | `127.0.0.1` | Bind address (keep loopback unless you intend otherwise). Hosted companions must use `0.0.0.0`. |
| `ONBOARDING_SCAN_PORT` | `8788` | Listen port. If unset, `PORT` is used (Render injects this). |
| `ONBOARDING_SCAN_CORS_ORIGIN` | echo request `Origin`, else `*` | CORS allow origin for the static site. One origin string; unset to allow seahorse-app and chapelgate staging together. |

See also `docs/ONBOARDING_SCAN_CONTRACT.md` and the $0 host runbook `docs/ONBOARDING_SCAN_DEPLOY.md`.

## Run locally

From the website repo root (Node 22+):

```bash
# Terminal 1 — scan service (still disabled until the ingest flag is on)
npm run onboarding-scan

# Enable crawl for local/staging only
ONBOARDING_WEB_INGEST=true npm run onboarding-scan
```

Health check:

```bash
curl -s http://127.0.0.1:8788/health
```

Manual scan:

```bash
curl -s -X POST http://127.0.0.1:8788/v1/onboarding/scan \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com/"}'
```

### Point `/create` at it

The Next.js **dev/build** process must see the absolute endpoint (static export inlines `NEXT_PUBLIC_*`):

```bash
# Terminal 2 — marketing site
NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT=http://127.0.0.1:8788/v1/onboarding/scan \
  npm run dev
```

Then open `/create/`, enter a public HTTPS URL, and continue. Step 2 should say a scan response was received only when this service returned mapped string fields. Empty fields mean “not found”, not invented copy.

For a static preview of `out/`:

```bash
ONBOARDING_WEB_INGEST=true npm run onboarding-scan
NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT=http://127.0.0.1:8788/v1/onboarding/scan npm run build
npx serve out
```

DigitalOcean static hosting cannot run this process. Staging `/create` needs a **separate** free-tier service (Render web service, not the frozen voice app) and a DigitalOcean **rebuild** after setting `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT`. Runbook: `docs/ONBOARDING_SCAN_DEPLOY.md`. No paid plan is required.

## SSRF rules (enforced)

1. HTTPS only (`allowPublicHttpsUrl` — http, userinfo, localhost, private/reserved IPs, metadata hosts denied)
2. DNS lookup, then `assertResolvedAddressesPublic` on every address
3. Connect to a resolved public IP with SNI/Host of the original hostname
4. Re-check scheme, hostname, and resolved IPs after every redirect
5. Caps: 5 pages, 256 KiB/page, 768 KiB total, 4 redirects, ~4s/page, 12s wall clock
6. `robots.txt` honoured when it can be fetched (`User-agent: *` and `MaintenanceOS-OnboardingScan`)
7. Fetched text is returned only as draft **data** (`untrusted: true`)

## Claims-safe extract

- Copy values that are present in JSON-LD, schema.org microdata, obvious meta/title, a clearly labelled hours/services/FAQ block, conservative visible-text patterns, navigation labels, or `tel:`/`mailto:` links.
- Do **not** invent a receptionist greeting, hours, services, or FAQs when extract fails.
- Failures return `{ "ok": false, "error": "…", "message": "…", "warnings": […] }` with no draft.
- Optional `fieldMeta` records **provenance + confidence** (`high` JSON-LD/microdata, `medium` labelled blocks, `low` nav/pattern). `/create` still maps only the five draft strings; unknown keys are ignored.

## Extract limits

This is **HTML copy**, not an LLM knowledge builder and not Fonio-parity.

| Limit | Behaviour |
| --- | --- |
| Pages | At most 5 public HTTPS documents already fetched (home + ranked about/services/faq/hours/contact). No JavaScript execution, no SPA hydration, no PDFs. |
| Name | JSON-LD / LocalBusiness microdata, else `og:site_name`, else cleaned `<title>` / `h1`. Generic titles like “Home” are skipped. |
| Greeting | Only an on-page slogan (`slogan` in JSON-LD/microdata). Meta description is **not** used as a greeting. |
| Hours | JSON-LD `openingHours` / `openingHoursSpecification`, microdata, a labelled heading, else lines that include a weekday **and** a time range (or 24/7 + open/hours). A lone “call us at 3pm” is not hours. |
| Services | JSON-LD offers, microdata `serviceType`, a labelled list/heading, else **two or more** non-generic nav labels. “Home / About / Contact” is not a service list. |
| FAQs | JSON-LD `FAQPage`, `<details>`/`<summary>`, `aria-expanded` accordion, `dt`/`dd`, or two or more heading+answer pairs that look like questions. |
| Contact | `tel:` / `mailto:` (and JSON-LD/microdata telephone/email) appended to the FAQs field as `Phone:` / `Email:` lines so the existing `/create` draft UI can show them. Not a new draft key. |
| Missing | Key omitted. Empty means “not found”, never a guessed value. Low-confidence fields still need human review. |

Crawled strings stay `untrusted: true`. Do not concatenate them into a system prompt.

## Tests

From repo root: `npm test` (includes `src/*.test.ts` here).

```bash
node --experimental-strip-types --test packages/onboarding-ingest/src/*.test.ts
```

Coverage: SSRF deny (localhost, private IPs, metadata, private DNS, redirect to metadata), feature flag off, robots `Disallow: /`, happy-path draft shape (`businessName`, `hours`, `services`, `faqs`), and HTML fixtures for JSON-LD/microdata/nav/hours/FAQ/contact heuristics.
