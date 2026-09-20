# MaintenanceOS marketing website

Truthful **pre-launch** marketing site for MaintenanceOS (not the product backend).

**Brand System v0.1 APPROVED** — amber accent `#B45309`, ink `#0F172A`, paper `#F8FAFC`, Inter. See `BRAND_SYSTEM.md`, `UI_VISUAL_SYSTEM.md`, and `src/app/globals.css`.

## Stance

- `PUBLIC_LAUNCH` defaults to **false** (`NEXT_PUBLIC_PUBLIC_LAUNCH` / `src/config/site.ts`).
- CTAs only: **Join launch list** / **Request early demo**.
- Never claim commercially live / GA / certified / production call-ready.
- No fake social proof, dashboards-as-live-product, customers, or certifications.
- Copy gated by `PRODUCT_CLAIMS_REGISTER.md`.
- `NEXT_PUBLIC_SITE_URL` — absolute origin for canonical URLs, Open Graph, JSON-LD, sitemap, and robots (see `.env.example`). If unset at build, `src/lib/site-url.ts` falls back to the DigitalOcean staging host.

## Stack

- Next.js 15 App Router + TypeScript + Tailwind CSS v4
- **Static export** (`output: 'export'`) → `out/` for DigitalOcean App Platform static (or any static host)
- **No Next.js API routes** (incompatible with static export)
- Provider-independent lead adapter (`src/lib/lead-adapter.ts`) posts JSON to `NEXT_PUBLIC_FORM_ENDPOINT` when that value is an absolute `http(s)` URL; otherwise a local success stub. Success UI **never claims email was sent**.
- Contract: [`docs/FORM_ENDPOINT_CONTRACT.md`](docs/FORM_ENDPOINT_CONTRACT.md). Local stub: `npm run form-stub` (`scripts/form-stub-server.mjs`)
- AI / search discoverability: `public/llms.txt`, `public/llms-full.txt`, JSON-LD (Organization, WebSite, pre-launch SoftwareApplication, FAQPage on `/faq/`), `src/app/robots.ts` (allows major AI crawlers), `src/app/sitemap.ts`

## Quick start

```bash
cp .env.example .env.local   # placeholders only — no secrets in git
npm install
npm run dev                  # local preview
npm run build                # emits out/
npm test                     # form-stub + llms.txt claims-safety checks
```

Serve the static site (optional): `npx serve out`.

### Lead capture (static export)

`launch_list`, `early_demo`, and `contact` render `LeadCaptureForm` (`/` `#join`, `/demo/`, `/contact/`). `/create/` uses `CreateReceptionistForm` with `lead_type` `create_receptionist`. The browser posts to `NEXT_PUBLIC_FORM_ENDPOINT`; this repo does not add `/api/*` routes. Optional site scan uses `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` (absolute URL only); if empty, `/create` queues crawl honestly and does not invent results.

### Website onboarding scan (companion service)

SSRF-safe crawl lives in `packages/onboarding-ingest` and is **off by default** (`ONBOARDING_WEB_INGEST`). It is a separate Node process so the static DigitalOcean export stays API-routeless. Contract: [`docs/ONBOARDING_SCAN_CONTRACT.md`](docs/ONBOARDING_SCAN_CONTRACT.md).

```bash
# Terminal 1 — enable crawl locally (loopback)
ONBOARDING_WEB_INGEST=true npm run onboarding-scan

# Terminal 2 — point /create at it (must be set for next dev/build)
NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT=http://127.0.0.1:8788/v1/onboarding/scan npm run dev
```

The client POSTs `{ "url" }` and copies only `businessName`, `greeting`, `hours`, `services`, and `faqs` when those strings are present. Fetch/extract failures return errors/warnings — nothing is invented. Leave the Next env empty on DigitalOcean static hosting until this process runs elsewhere.

```bash
# Terminal 1 — loopback stub (stores JSONL under .data/, never sends mail)
npm run form-stub

# Terminal 2 — point the static site at the stub
NEXT_PUBLIC_FORM_ENDPOINT=http://127.0.0.1:8787/leads npm run dev
```

Leave `NEXT_PUBLIC_FORM_ENDPOINT` empty to exercise the client-only stub. Either way, thank-you copy must not say that email was sent. DigitalOcean static hosting cannot run this stub; production needs a contract-compliant external endpoint.

### DigitalOcean App Platform (static)

Point the static site at the `out/` directory produced by `npm run build`. Set env vars from `.env.example` in the App Platform UI — never commit secrets.

## Desktop navigation (IA v0.2)

How it works · Features · AI receptionist · Security · **Pricing** · Industries (+ Join launch list CTA). `/demo` is the conversion canon (launch list + early demo tabs/sections).

## Programme docs (repo root)

- `CURSOR_HANDOFF.md`
- `WEBSITE_ARCHITECTURE.md`
- `PRODUCT_CLAIMS_REGISTER.md`
- `WEBSITE_AGENT_BOARD.md`
- `WEBSITE_LAUNCH_CHECKLIST.md`
- `WEBSITE_BACKLOG.md`
- `WEBSITE_IA.md`
- `MISSION_BRIEF.md`

## Secrets

None in this repository. Use `.env.example` placeholders only.
