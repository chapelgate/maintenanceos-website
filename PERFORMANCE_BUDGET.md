# PERFORMANCE_BUDGET.md — MaintenanceOS marketing site

**Owner:** MOS FE Perf Impl (aligns with MOS Performance)  
**Updated:** 2026-09-21T14:00 BST  
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
| Images (home) | ≤ 250 KB transfer | Three self-hosted WebPs in `public/media/home/` (phone / trade / street); width/height; no terrace LCP; lazy below fold |
| Client components | Lead forms only by default | CSS `<details>` for nav |

## Baseline → after first pass (local `out/`, 2026-09-17)

| Item | Before | After | Notes |
|------|--------|-------|-------|
| SiteHeader | `"use client"` (FE Shell #11) | Server + `<details>` | Preserves Shell CTA chrome (desktop outline Early access + solid Create from website; mobile Create + hamburger). Does not clobber Shell chrome. |
| Content pages First Load JS | (header in client graph) | **103 kB** | Next build report |
| Home / demo / contact First Load JS | — | **105 kB** | + form island |
| Inter config | all default weights | `weight: ["400","600"]`, `display: "swap"` | Variable files still ~219 KB on disk; en-GB typically pulls ~latin preload + latin (~133 KB), not cyrillic/greek |
| CSS | ~23 KB | + summary focus | Harmless `summary:focus-visible` for native disclosure |
| Images in `public/` | none | none | Budget ready for when UI lands assets |

## Funnel pass after SEO #52 (local `out/`, 2026-09-21)

Default DigitalOcean flags (`NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED` and `NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED` unset/false). Next report First Load JS.

| Route | Before (main @ #52) | After | Notes |
|-------|---------------------|-------|-------|
| `/`, `/contact` | 106 kB | **106 kB** | Lead-form island only |
| `/demo` | 107 kB | **107 kB** | Tabs + lead form |
| `/how-it-works`, `/features` | 103 kB | **103 kB** | Shared Next/React runtime; no page client island |
| `/create` | **117 kB** (14.7 kB page) | **111 kB** (7.94 kB page) | Over 110 kB target by 1 kB — remaining island is the lead form |

| Item | Before | After | Notes |
|------|--------|-------|-------|
| SiteHeader | `"use client"` + `useEffect` Escape | Server + native `<details>` + inline Escape script | Layout client chunk 7.9 KB → 0.4 KB; not referenced on content-page HTML |
| `/create` companion JS | Calendar + sandbox + `CreateJourney` in page chunk (52 KB uncompressed, includes `calendar-slot` / scripted demo) | Server coming-soon copy; companion modules aliased in only when a public flag is on | Default `create/index.html` does not reference those chunks |
| Pack preview | Eager in `/create` page chunk | `next/dynamic` + deferred `receptionist-draft` | Async chunks exist on disk (~8 KB) but are not in initial `/create` script tags |
| Inter | `400`/`600`, `display: swap`, latin preload | unchanged | Preload woff2 **48 KB**; other unicode-range files stay on disk, not in critical path |
| Images in `public/` | none | three home WebPs (phone / trade / street; terrace dropped) | Hero LCP is paper + CSS orb; lifestyle/street stills lazy; see `public/media/home/SOURCES.md` |

`/create` after #53 was **1 kB over** the 110 kB First Load target (shared 103 kB + 7.94 kB form island).

## Follow-up after funnel #53 (local `out/`, 2026-09-21)

Default DigitalOcean flags still unset/false. Later check/review/pack steps are a `next/dynamic` chunk (`ssr: false`) prefetched after the URL island hydrates. Same claims and CTA labels.

| Route | After #53 | After this pass | Budget |
|-------|-----------|-----------------|--------|
| `/`, `/contact` | 106 kB | **106 kB** | ≤ 110 |
| `/demo` | 107 kB | **107 kB** | ≤ 110 |
| `/how-it-works`, `/features` | 103 kB | **103 kB** | ≤ 110 |
| `/create` | **111 kB** (7.94 kB page) | **106 kB** (3.7 kB page) | ≤ 110 |

Home hero proof is a paper orb stage + static `ProductUiShell`. A small `SiriOrbCloud` island is restored as a secondary listening cue on home only — not on `/create`. Band accents are CSS-only (`IntakeOrbAccent`) and do not add First Load JS.

`/create` First Load is now **under** the 110 kB target. The leftover 3.7 kB page island is the URL/email step plus the shared stepper. Scan, pack preview, and lead-submit stay off the initial `create/index.html` script tags (async chunks remain on disk). This is a split, not a form rewrite: step 1 still hydrates immediately; step 2 already shows “Checking URL…” for 700 ms.

Flagged-on local rebuild (`NEXT_PUBLIC_SANDBOX_TEST_CALL_ENABLED=true` + `NEXT_PUBLIC_CALENDAR_ADAPTERS_ENABLED=true`) after #53 was **118 kB** First Load on `/create` (15.2 kB page) — expected; companions stay off the DigitalOcean default graph via `NormalModuleReplacementPlugin` / Turbopack alias.

## Standing rules for FE agents

1. **Fonts:** `next/font` Inter, `subsets: ['latin']`, `display: 'swap'`, weights **400 + 600** only. Prefer `font-semibold` / `font-normal` over `font-medium` (500 not loaded as a discrete face). No extra families without Performance + Brand sign-off.
2. **Images:** With `unoptimized`, always set `width`/`height` (or CSS aspect-ratio), compress before commit, prefer WebP, `loading="lazy"` below fold, `fetchPriority="high"` only for true LCP image.
3. **JS:** Do not mark layout chrome `"use client"` for menus if CSS `<details>` works. Keep client islands on lead forms and the tiny home orb. Homepage photographs + `ProductUiShell` stay server/static. Do not import the interactive orb on `/create`.
4. **Third parties:** No analytics/chat/tag managers without Privacy + Performance review (consent-gated).
5. **Measure:** Re-run `next build` and update this table when changing fonts, layout, or shared components. Lighthouse/CWV when staging URL exists.
6. **Product tour:** Self-hosted `/media/product-tour.mp4` (720p / 45s / **0.95 MB** with Desmond AAC, soft ≤~3 MB, ceiling ~8–12 MB). Home is a text link only. `/how-it-works/#product-tour` is below the flow, `preload="none"`, no autoplay. Residual: the poster WebP (~26 KB) may download when that page is parsed (not LCP on home; reserve 16:9 to avoid CLS). Do not preload the mp4.

## Done this pass

- [x] Draft budget + CWV targets
- [x] Restrict Inter to 400/600 + swap/preload
- [x] Server SiteHeader via native `<details>` (Escape kept as a tiny inline script — no layout `"use client"`)
- [x] Drop unused `/create` calendar + sandbox client islands from the default static export
- [x] Defer `/create` pack-preview + `receptionist-draft` until after the URL/check steps
- [x] Defer `/create` check/review/pack steps so default First Load JS is **106 kB** (≤ 110)

## Open work

- [ ] Optional: self-host tighter latin-only Inter subset if critical-path fonts stay >100 KB on staging
- [ ] Shared `MosImage` helper for unoptimized static export (width/height/lazy defaults)
- [ ] Staging CWV / Lighthouse once DO URL exists
- [x] Claims-safe product tour on `/how-it-works/#product-tour` (click-to-play, poster + en-GB captions; home watch-link only)
