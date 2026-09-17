# WEBSITE_ARCHITECTURE.md

**Owner:** MOS Documentation (draft)  
**Updated:** 2026-09-17T15:35 BST  
**Scope:** Marketing website only — not the MaintenanceOS product backend.  
**Mode:** PRE-LAUNCH (`PUBLIC_LAUNCH=false`)

## Open decisions

| ID | Decision | State |
|----|----------|-------|
| D1 | Where website source lives (new chapelgate repo vs path inside pilot vs other) | OPEN — board B1 |
| D2 | Hosting (e.g. Vercel) and staging URL | UNVERIFIED |
| D3 | Lead-capture provider (email API, form SaaS, or queue-to-store) | OPEN — Forms Engineer |
| D4 | Brand system v0.1 approval | AWAITING OWNER |

## Relationship to product

| Repo / artefact | Role |
|-----------------|------|
| `chapelgate/maintenanceos-v1-pilot` | Capability **evidence** only (README, ARCHITECTURE, CURRENT_STATUS, issues). Do not publish internal hosts/IPs. |
| Website / marketing repo | **NOT FOUND** (2026-09-17). This docs pack lives at `/workspace/chapelgate-ops/docs/website/` until D1. |

## Proposed stack

- Next.js App Router, TypeScript, Tailwind CSS
- Config module for `PUBLIC_LAUNCH`, pricing copy mode, feature flags
- Provider-independent lead-capture **adapters** (swap implementation without rewriting pages)
- Minimal client JS; prefer Server Components

## Page map (from mission brief + IA)

See [WEBSITE_IA.md](./WEBSITE_IA.md) for full hierarchy. Minimum routes:

`/`, `/how-it-works`, `/features`, `/ai-receptionist`, `/industries/*`, `/security`, `/pricing`, `/demo`, `/contact`, `/about`, `/faq`, `/status` (architecture placeholder — no fake live metrics), `/privacy`, `/cookies`, `/terms`.

Reserved stubs (no fake backends): account login, dashboard, onboarding, demo env, customer portal, API docs, billing, live status metrics.

## Config and trust boundaries

```
Browser
  → Marketing site (Next.js)
       → Lead adapter (validate → store/queue)
       → Optional consent-gated analytics
  ✗ No direct write into product telephony / work-order systems from marketing forms
  ✗ No secrets in git; use env vars + `.env.example` only
  ✗ No consequential outbound email unless explicitly configured and reviewed
```

- **Claims gate:** copy and CTAs must match `PRODUCT_CLAIMS_REGISTER.md`.
- **PUBLIC_LAUNCH:** when `false`, site presents waitlist/demo CTAs and pre-launch wording; when `true` (future), still must not invent capabilities — flip only after launch checklist.

## Security posture (marketing site)

Headers/CSP, form CSRF/rate limits, dependency hygiene, XSS-safe rendering — owned by MOS Security; results land in `WEBSITE_SECURITY_REVIEW.md`.

## Accessibility / performance / SEO

- WCAG 2.2 AA baseline: `WCAG_22_AA_BASELINE.md`
- Performance: Core Web Vitals, page weight, font/image budget — MOS Performance
- SEO: titles, meta, sitemap, robots, OG, structured data — MOS SEO Architect (no aggressive promo)

## Deploy shape (target)

Reproducible staging + production instructions owned by MOS DevOps once D1/D2 land. Until then: document locally as “staging URL unverified.”
