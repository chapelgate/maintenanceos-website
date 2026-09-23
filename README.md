# MaintenanceOS marketing website

Truthful **pre-launch** marketing site for MaintenanceOS (not the product backend).

**Brand System v0.3 + Local warmth override (2026-09-23)** — warm linen paper `#F3EEE4`, blue accent `#1D4ED8` / `#DBEAFE`. Homepage hero is photographic UK ops stills + a labelled UNDER TEST supervisor UI shell + a secondary intake orb. Wordmark stays flat ink. See `BRAND_SYSTEM.md`, `UI_VISUAL_SYSTEM.md`, and `src/app/globals.css`.

## Stance

- `PUBLIC_LAUNCH` defaults to **false** (`NEXT_PUBLIC_PUBLIC_LAUNCH` / `src/config/site.ts`).
- CTAs: **Create from website** (primary public path) / **Join launch list** / **Request early demo** (secondary human briefing — not a live phone).
- Never claim commercially live / GA / certified / production call-ready.
- No fake social proof, dashboards-as-live-product, customers, or certifications.
- Copy gated by `PRODUCT_CLAIMS_REGISTER.md`.
- `NEXT_PUBLIC_SITE_URL` — absolute origin for canonical URLs, Open Graph, JSON-LD, sitemap, and robots (see `.env.example`). If unset at build, `src/lib/site-url.ts` falls back to the DigitalOcean staging host.

## Stack

- Next.js 15 App Router + TypeScript + Tailwind CSS v4
- Product tour: in-repo CSS storyboard → Chrome → ffmpeg, then remux committed Desmond VO (`npm run product-tour` / `npm run product-tour:remux`). Self-hosted on `/how-it-works/#product-tour`. No paid AI video.
- **Static export** (`output: 'export'`) → `out/` for DigitalOcean App Platform static (or any static host)
- **No Next.js API routes** (incompatible with static export)
- Provider-independent lead adapter (`src/lib/lead-adapter.ts`) posts JSON to `NEXT_PUBLIC_FORM_ENDPOINT` when that value is an absolute `http(s)` URL; otherwise a local success stub. Success UI **never claims email was sent**.
- Contract: [`docs/FORM_ENDPOINT_CONTRACT.md`](docs/FORM_ENDPOINT_CONTRACT.md). Local stub: `npm run form-stub` (`scripts/form-stub-server.mjs`)
- AI / search discoverability: `public/llms.txt`, `public/llms-full.txt`, JSON-LD (Organization + WebSite on every page; WebPage + claims-safe SoftwareApplication on `/`, `/create/`, `/demo/`, `/how-it-works/`, `/features/`; FAQPage on `/faq/`; no telephone, ratings, or offers), `src/app/robots.ts` (allows major AI crawlers), `src/app/sitemap.ts`

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

The client POSTs `{ "url" }` and copies only `businessName`, `greeting`, `hours`, `services`, and `faqs` when those strings are present. Fetch/extract failures return errors/warnings — nothing is invented. After draft review, `/create` builds a claims-safe knowledge pack + system prompt (`packages/receptionist-draft`; `docs/RECEPTIONIST_DRAFT_CONTRACT.md`) without a companion. Leave the Next env empty on DigitalOcean static hosting until a **separate** DigitalOcean droplet companion is up (`docs/ONBOARDING_SCAN_DEPLOY.md`) — then set `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` and **rebuild**. Do not use Render. Do not put this process on the frozen voice app.

```bash
# Terminal 1 — loopback stub (stores JSONL under .data/, never sends mail)
npm run form-stub

# Terminal 2 — point the static site at the stub
NEXT_PUBLIC_FORM_ENDPOINT=http://127.0.0.1:8787/leads npm run dev
```

Leave `NEXT_PUBLIC_FORM_ENDPOINT` empty to exercise the client-only stub. Either way, thank-you copy must not say that email was sent. DigitalOcean static hosting cannot run this stub; production needs a contract-compliant external endpoint.

### Calendar adapters (companion + /create panel)

Provider-agnostic book / reschedule lives in `packages/calendar-adapters` and is **off by default** (`CALENDAR_ADAPTERS_ENABLED`). Same static-export rule: no Next `/api/*` routes. Contract: [`docs/CALENDAR_ADAPTERS_CONTRACT.md`](docs/CALENDAR_ADAPTERS_CONTRACT.md).

```bash
# Terminal 1 — mock adapter on loopback
CALENDAR_ADAPTERS_ENABLED=true CALENDAR_ADAPTER_PROVIDER=mock npm run calendar-adapters

# Terminal 2 — show the /create slot picker
NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED=true \
NEXT_PUBLIC_CALENDAR_ENDPOINT=http://127.0.0.1:8789/v1/calendar \
  npm run dev
```

Leave both public vars unset/false on DigitalOcean static hosting until a **separate** free-tier mock companion is up (`docs/SANDBOX_DEPLOY.md`, calendar section) — then set `NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED` and `NEXT_PUBLIC_CALENDAR_ENDPOINT` and **rebuild**. `/create` then says **Calendar connect — coming / under testing** until that rebuild. If the public flag is on and the endpoint is empty, the picker uses an in-browser mock labelled as local testing only.

Google Calendar / Microsoft 365: local OAuth scaffold on the companion only (`GET /oauth/google/start` → `/oauth/google/callback`; see `packages/calendar-adapters/README.md`). No secrets in git. Mock is the default when Google env is missing. Do not claim Google Calendar is live on staging. Do not wire this to frozen live telephony.

### Sandbox test call (companion + /create panel)

A claims-safe “call my receptionist” **foundation** lives in `packages/sandbox-test-call` and is **off by default** (`SANDBOX_TEST_CALL_ENABLED` / `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED`). Same static-export rule: no Next `/api/*` routes. Contract: [`docs/SANDBOX_TEST_CALL_CONTRACT.md`](docs/SANDBOX_TEST_CALL_CONTRACT.md).

```bash
# Terminal 1 — sandbox companion on loopback
SANDBOX_TEST_CALL_ENABLED=true npm run sandbox-test-call

# Terminal 2 — show honest /create controls
NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED=true \
NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT=http://127.0.0.1:8790/v1/sandbox \
  npm run dev
```

Leave both public vars unset/false on DigitalOcean static hosting until a **separate** free-tier companion is up (`docs/SANDBOX_DEPLOY.md`) — then set `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED` and `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENDPOINT` and **rebuild**. `/create` then says **Sandbox test call — under testing / coming** until that rebuild. If the public flag is on and the endpoint is empty, the panel uses an in-browser scripted stub labelled as local testing only. Asking for WebRTC / live media returns `not_configured` — this is not production telephony and does not touch the frozen live voice path. Do not claim Fonio-parity voice quality.

### Customer dashboard (call history / transcripts / bookings stub)

Claims-safe `/dashboard` lives in `packages/customer-dashboard` and is **off by default** (`CUSTOMER_DASHBOARD_ENABLED` / `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED`). Same static-export rule: no Next `/api/*` routes. Contract: [`docs/CUSTOMER_DASHBOARD_CONTRACT.md`](docs/CUSTOMER_DASHBOARD_CONTRACT.md).

```bash
# Terminal 1 — SAMPLE catalogue on loopback
CUSTOMER_DASHBOARD_ENABLED=true npm run customer-dashboard

# Terminal 2 — show the labelled demo dashboard
NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED=true \
NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT=http://127.0.0.1:8791/v1/dashboard \
  npm run dev
```

Leave both public vars unset/false on DigitalOcean static hosting until a **separate** free-tier companion is up (`docs/DASHBOARD_DEPLOY.md`) — then set `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED` and `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENDPOINT` and **rebuild**. `/dashboard` then says **Customer dashboard — coming / under testing** until that rebuild. If the public flag is on and the endpoint is empty, the page uses an in-browser mock labelled **SAMPLE / DEMO**. An empty store (`CUSTOMER_DASHBOARD_DEMO_DATA=false`, or the in-browser “Empty store” control) invents no customers. Hosted rows stay SAMPLE / DEMO — never present them as live production analytics.

Nav shows **Dashboard (soon)** when the public flag is off, and **Dashboard** when it is on. Do not wire this to frozen live telephony.

### Local Fonio e2e stack (loopback only)

To demo the website→receptionist **loop shape** with companions flagged on locally, see [`docs/FONIO_LOCAL_E2E.md`](docs/FONIO_LOCAL_E2E.md). Env names: [`.env.example.fonio-local`](.env.example.fonio-local).

```bash
./scripts/fonio-local-stack.sh up     # scan 8788 + calendar 8789 + sandbox 8790 + dashboard 8791
cp .env.example.fonio-local .env.local
npm run dev                          # then open /create/ (and optional /dashboard/)
npm run fonio-local-smoke
./scripts/fonio-local-stack.sh down
```

This is **not** production Fonio-parity and **must not** be copied onto DigitalOcean static hosting. Default `.env.example` flags stay off. Optional Compose: `docker compose -f docker-compose.fonio-local.yml up`.

What is already on `main` through PR **#64** vs owner blockers (live scan on a DigitalOcean droplet, legal review, frozen telephony): [`docs/FONIO_WEBSITE_READINESS.md`](docs/FONIO_WEBSITE_READINESS.md). Website onboarding path is substantially ready; live phone parity is still open. Not a complete-vs-Fonio claim. Do not use Render.

### DigitalOcean App Platform (static)

Point the static site at the `out/` directory produced by `npm run build`. Set env vars from `.env.example` in the App Platform UI — never commit secrets. Do not use `.env.example.fonio-local`, `docker-compose.fonio-local.yml`, or `render.yaml` / companion Dockerfiles on App Platform; those are loopback e2e or the **separate** droplet companion (`docs/ONBOARDING_SCAN_DEPLOY.md`). `render.yaml` is **legacy / do not use**. Staging operator order (exact `NEXT_PUBLIC_*`, rebuild, health check): [`docs/STAGING_COMPANIONS.md`](docs/STAGING_COMPANIONS.md). Owner blocker: [`docs/FONIO_WEBSITE_READINESS.md`](docs/FONIO_WEBSITE_READINESS.md). `NEXT_PUBLIC_*` changes require a rebuild, not a runtime-only restart. Static security baseline (HTML CSP + referrer; HTTP-only header gap on this host): [`docs/security/static-security-baseline.md`](docs/security/static-security-baseline.md).

## Desktop navigation (IA v0.2)

How it works · Features · AI receptionist · Create · **Dashboard (soon)** · Security · **Pricing** · Industries. Primary chrome CTA is **Create from website**. `/demo` is launch list + early-access briefing (not a live phone). `/dashboard` is coming / under testing unless `NEXT_PUBLIC_CUSTOMER_DASHBOARD_ENABLED` is on.

## Programme docs (repo root)

- `CURSOR_HANDOFF.md`
- `WEBSITE_ARCHITECTURE.md`
- `PRODUCT_CLAIMS_REGISTER.md`
- `WEBSITE_AGENT_BOARD.md`
- [`docs/FONIO_WEBSITE_READINESS.md`](docs/FONIO_WEBSITE_READINESS.md) — onboarding path on `main` through #64 vs owner blockers (droplet scan; do not use Render)
- `WEBSITE_LAUNCH_CHECKLIST.md`
- `WEBSITE_BACKLOG.md`
- `WEBSITE_IA.md`
- `MISSION_BRIEF.md`
- [`docs/competitive/PHONE_AI_FEATURE_INVENTORY.md`](docs/competitive/PHONE_AI_FEATURE_INVENTORY.md) — internal Phone AI inventory for MOS Product Investigator; `/features` promotes the short VERIFIED / UNDER TEST card set only

## Secrets

None in this repository. Use `.env.example` placeholders only.
