# WEBSITE_ARCHITECTURE.md

**Owner:** MOS Website Manager
**Updated:** 2026-09-26
**Scope:** Marketing website only — not the MaintenanceOS product backend.
**Mode:** PRE-LAUNCH (`PUBLIC_LAUNCH=false`)

## Settled architecture decisions

| ID | Decision | State |
|----|----------|-------|
| D1 | Website source location | **CLOSED** — `chapelgate/maintenanceos-website`, branch `main` |
| D2 | Hosting and staging URL | **CLOSED** — DigitalOcean App Platform static; `https://seahorse-app-4oasq.ondigitalocean.app` |
| D3 | Lead-capture provider | **CLOSED** — provider-independent browser adapter posts to the existing Railway control plane; audited Postgres storage + operator notification already live |
| D4 | Brand system | **CLOSED BASELINE** — implemented and live; later commercial refinement is iterative work, not an unresolved architecture decision |

Authoritative deployment/source record: [`WEBSITE_SOURCE_OF_TRUTH.md`](./WEBSITE_SOURCE_OF_TRUTH.md).

## Relationship to product

| Repo / artefact | Role |
|-----------------|------|
| `chapelgate/maintenanceos-website` | **Canonical marketing website source.** Next.js static export, content, SEO, lead UI and claims-safe website companions. |
| `chapelgate/maintenanceos-v1-pilot` | **Canonical product/backend source.** Capability evidence, voice/runtime, safety/lifecycle rules and operational dashboard. Not the marketing-site source. |
| `chapelgate/cloud-workers` | Shared/legacy infrastructure only. Not the website source. |
| `chapelgate/chapelgate-technologies-website` | Separate corporate website. Not a MaintenanceOS website duplicate. |

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- Static export: `npm run build` → `out/`
- DigitalOcean App Platform static hosting
- Config module for public-launch state and feature flags
- Provider-independent lead-capture adapters
- Minimal client JS where possible

## Page map

Current routes include:

`/`, `/how-it-works`, `/features`, `/ai-receptionist`, `/industries/*`, `/security`, `/pricing`, `/demo`, `/contact`, `/about`, `/faq`, `/status`, `/privacy`, `/cookies`, `/terms`, `/create`, and the claims-safe `/dashboard` foundation.

## Config and trust boundaries

```
Browser
  → Marketing site (Next.js static export)
       → Lead adapter (validate → external endpoint when configured)
       → Optional flagged companion services
  ✗ No direct write into frozen product telephony from marketing forms
  ✗ No secrets in git
  ✗ No invented product capabilities or commercial-live claims
```

- **Claims gate:** copy and CTAs must match `PRODUCT_CLAIMS_REGISTER.md`.
- **PUBLIC_LAUNCH:** remains false until launch gates explicitly pass.
- **Product boundary:** marketing code does not replace backend safety or voice code.

## Security / accessibility / performance / SEO

- Static security baseline: `docs/security/static-security-baseline.md`
- Accessibility gap audit: `docs/A11Y_GAP_AUDIT.md`
- Performance budget: `PERFORMANCE_BUDGET.md`
- SEO: metadata, sitemap, robots, JSON-LD, `llms.txt` / `llms-full.txt`

## Deployment shape

- Source repository: `chapelgate/maintenanceos-website`
- Authoritative release branch: `main`
- Build command: `npm run build`
- Output directory: `out/`
- Host class: DigitalOcean App Platform static
- Recorded staging host: `https://seahorse-app-4oasq.ondigitalocean.app`
- Rollback pin and evidence: `WEBSITE_SOURCE_OF_TRUTH.md`

The connected DigitalOcean tool surface does not currently expose App Platform source-link metadata. Do not create another app to compensate; verify provider-side linkage before any future hosting mutation.
