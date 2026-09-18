# PERFORMANCE_BUDGET.md — MaintenanceOS marketing site

**Owner:** MOS FE Perf Impl (aligns with MOS Performance)  
**Updated:** 2026-09-17T16:25 BST  
**Scope:** Static export (`output: 'export'`) for DigitalOcean App Platform free static.  
**Images:** `images.unoptimized: true` — no Next image optimizer at runtime; treat every `<img>` / asset as fully downloaded bytes.

## Targets (pre-staging; measure on real URL when live)

| Metric | Target | Notes |
|--------|--------|-------|
| LCP | ≤ 2.5 s (good) | Text/hero; avoid late fonts and huge above-fold images |
| INP | ≤ 200 ms | Minimal client JS; forms only where needed |
| CLS | ≤ 0.1 | Reserve space for banners/nav; font `display: swap` + size-adjust |
| First Load JS (Next report) | ≤ 110 kB | Shared chunks dominate |
| Fonts (critical en-GB path) | ≤ 100 KB transfer | Browser skips unused unicode-range files |
| Images (home) | ≤ 250 KB transfer | WebP/AVIF; width/height; lazy below fold |
| Client components | Lead forms only by default | CSS `<details>` for nav |

## Baseline → after first pass (local `out/`, 2026-09-17)

| Item | Before | After | Notes |
|------|--------|-------|-------|
| SiteHeader | `"use client"` (FE Shell #11) | Server + `<details>` | Preserves Shell amber CTA chrome (desktop outline Request early demo + solid Join launch list; mobile Join launch list + hamburger). Does not clobber Shell chrome. |
| Content pages First Load JS | (header in client graph) | **103 kB** | Next build report |
| Home / demo / contact First Load JS | — | **105 kB** | + form island |
| Inter config | all default weights | `weight: ["400","600"]`, `display: "swap"` | Variable files still ~219 KB on disk; en-GB typically pulls ~latin preload + latin (~133 KB), not cyrillic/greek |
| CSS | ~23 KB | + summary focus | Harmless `summary:focus-visible` for native disclosure |
| Images in `public/` | none | none | Budget ready for when UI lands assets |

## Standing rules for FE agents

1. **Fonts:** `next/font` Inter, `subsets: ['latin']`, `display: 'swap'`, weights **400 + 600** only. Prefer `font-semibold` / `font-normal` over `font-medium` (500 not loaded as a discrete face). No extra families without Performance + Brand sign-off.
2. **Images:** With `unoptimized`, always set `width`/`height` (or CSS aspect-ratio), compress before commit, prefer WebP, `loading="lazy"` below fold, `fetchPriority="high"` only for true LCP image.
3. **JS:** Do not mark layout chrome `"use client"` for menus if CSS `<details>` works. Keep client islands on lead forms only when possible.
4. **Third parties:** No analytics/chat/tag managers without Privacy + Performance review (consent-gated).
5. **Measure:** Re-run `next build` and update this table when changing fonts, layout, or shared components. Lighthouse/CWV when staging URL exists.

## Done this pass

- [x] Draft budget + CWV targets
- [x] Restrict Inter to 400/600 + swap/preload
- [x] Server SiteHeader via native `<details>`, preserving Shell #11 CTA chrome (desktop Request early demo + Join launch list). Does not clobber Shell header.

## Open work

- [ ] Optional: self-host tighter latin-only Inter subset if critical-path fonts stay >100 KB on staging
- [ ] Shared `MosImage` helper for unoptimized static export (width/height/lazy defaults)
- [ ] Staging CWV / Lighthouse once DO URL exists
- [ ] Commit budget + scaffold perf fixes to `chapelgate/maintenanceos-website` when scaffold is on remote (today: README only)
