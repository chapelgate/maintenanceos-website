# MaintenanceOS marketing website

Truthful **pre-launch** marketing site for MaintenanceOS (not the product backend).

**Brand System v0.1 APPROVED** — amber accent `#B45309`, ink `#0F172A`, paper `#F8FAFC`, Inter. See `BRAND_SYSTEM.md`, `UI_VISUAL_SYSTEM.md`, and `src/app/globals.css`.

## Stance

- `PUBLIC_LAUNCH` defaults to **false** (`NEXT_PUBLIC_PUBLIC_LAUNCH` / `src/config/site.ts`).
- CTAs only: **Join launch list** / **Request early demo**.
- Never claim commercially live / GA / certified / production call-ready.
- No fake social proof, dashboards-as-live-product, customers, or certifications.
- Copy gated by `PRODUCT_CLAIMS_REGISTER.md`.

## Stack

- Next.js 15 App Router + TypeScript + Tailwind CSS v4
- **Static export** (`output: 'export'`) → `out/` for DigitalOcean App Platform static (or any static host)
- Provider-independent lead adapter (`src/lib/lead-adapter.ts`) — posts to `NEXT_PUBLIC_FORM_ENDPOINT` when set; otherwise success stub / queue message (does **not** claim email was sent)
- No Node API routes (static-export compatible)

## Quick start

```bash
cp .env.example .env.local   # placeholders only — no secrets in git
npm install
npm run dev                  # local preview
npm run build                # emits out/
```

Serve the static site (optional): `npx serve out`.

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
