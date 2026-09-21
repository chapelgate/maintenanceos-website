# UI Visual System v0.2 — orb / cloud / glass

**Status:** marketing site (2026-09-21).  
**Do not regress** to hard slate borders, 8px cards, and a flat “Work orders” placeholder as the homepage hero.

## Surfaces

- **Glass** (`.mos-glass`): translucent white, `backdrop-filter` blur, luminous soft shadow, radius 20px.
- **Dusk glass** (`.mos-glass-dusk`): frosted panel on the hero orb stage.
- **Page hero** (`.mos-page-hero`): light glass band with a decorative corner glow. Used by inner routes via `PageHero`.
- **Home hero** (`.mos-hero-dusk`): deep cool canvas; orb is the visual centrepiece.

Radii: 12px default, 20px cards, 28px cloud. Shadows are soft and luminous — not 1px slate boxes.

## Orb → cloud (homepage)

`SiriOrbCloud` is a **tiny client island** (toggle + Escape + focus return).

| State | Behaviour |
| --- | --- |
| Idle | Soft multi-stop radial orb; gentle breathe pulse |
| Press / click / keyboard | Orb scales; frosted cloud panel reveals Create from website + early access |
| Escape | Closes; focus returns to the orb button |
| `prefers-reduced-motion: reduce` | Static orb; open/close is instant (global motion cut) |

Accessibility: real `<button>`, `aria-expanded`, `aria-controls`, `inert` on the closed panel, visible focus ring (luminous on dusk). **Not modal** — no focus trap. Not a live phone control.

## `/create`

Same language, lightly: `CreateOrbAccent` is **CSS-only** (mini orb). Do not add the interactive orb island here — First Load JS budget (`PERFORMANCE_BUDGET.md`). Do not change scan/form wiring (`NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT`).

## Chrome

- `SiteHeader` stays a **server** component (`<details>` + inline Escape). Frosted bar, larger CTA radii.
- `CtaPair` `tone="on-dusk"` for dusk canvases; default tone for paper/glass.
- `PreLaunchBanner` / `SiteFooter` use dusk + on-dusk text.

## Motion

CSS-first. Duration ~280ms, ease `cubic-bezier(0.22, 1, 0.36, 1)`. Honour `prefers-reduced-motion: reduce` globally. No WebGL, no hero image assets.

## Contrast

Text on paper/glass stays ink/muted (AA). Text on dusk uses on-dusk / luminous amber — **do not** use `#B45309` as small text on dusk. Button fills stay `#B45309` + white.

## Anti-patterns

- Flat “Work orders” metric cards as the hero visual
- Hard `#E2E8F0` boxes everywhere
- Client JS on layout chrome
- Interactive orb on `/create` (budget)
- Fake live-call UI, always-on phone, fabricated social proof
