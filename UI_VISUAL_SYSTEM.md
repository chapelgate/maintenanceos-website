# UI Visual System v0.3 — council lock

**Status:** Design council lock, 2026-09-22.  
**Do not** make the orb the brand mark or the primary conversion control.  
**Do not** invent a dusk / dark-glass theme. If frost kills contrast, drop blur first.  
**Do not** fill the wordmark with accent blue — it stays flat ink.

## Surfaces

- **Paper / surface:** light (`#F8FAFC` / `#FFFFFF`). Home hero stays light so blue CTAs remain WCAG AA.
- **Ops glass** (`.mos-glass`): surface fill, 1px line (`--mos-line`), **one** `backdrop-filter` layer (≤12px blur), brand `--mos-shadow`, **12px** radius, ink type. Max **two** blur layers on a view (orb halo + panel).
- **Page hero** (`.mos-page-hero`): light surface + a single blue wash (gradient only, no extra blur).

Buttons, focus rings, and in-panel links inherit the existing system: `rounded-md`, `bg-accent` / outline secondary, `outline: 2px solid var(--color-accent)`.

## Orb → cloud (homepage only)

`SiriOrbCloud` is a **tiny client island** (toggle + Escape + focus into panel + restore). Secondary affordance: **intake listening**.

| State | Behaviour |
| --- | --- |
| Idle | Soft `#3B82F6`→sky→white orb; calm morph / drift / glow pulse (CSS-only, secondary) |
| Press / Enter / Space | CSS expand into ops-glass cloud (opacity + transform, 220ms ease) |
| Panel copy | Short honesty + links to `/how-it-works/` and `/create/` |
| Escape | Close; focus returns to the orb button |
| `prefers-reduced-motion: reduce` | Static orb (no morph/pulse); instant open/close for orb and menus |

Do **not** nest `CtaPair`, the create funnel, or fake metrics in the glass. No GSAP unless gated on `prefers-reduced-motion: no-preference` (CSS-first is enough).

## `/create`

Light PageHero wash only. **Never** place an orb above the URL field. Do not import the interactive orb. Scan/form wiring (`NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT`) is untouched.

## Chrome

- `SiteHeader` stays a **server** component (`<details>` + inline Escape).
- Wordmark stays flat `text-ink` — no accent fill.
- `CtaPair` stays the primary conversion control on the home hero.
- Banner / footer stay ink-on-paper as on main — not a dusk theme.

## Motion / assets

CSS-first (transform / opacity / filter; no springs). Header `<details>` open/close is 200ms fade+slide. No WebGL, no paid Higgsfield **hero** assets. Home hero stays video-free. The only approved motion picture is the self-hosted click-to-play tour on `/how-it-works/#product-tour` (`public/media/`, regenerate with `npm run product-tour`). Client island must stay ≤ ~15–20 kB gz. No GSAP unless gated on `prefers-reduced-motion: no-preference`.

## Anti-patterns

- Orb as logo or primary CTA (“press the glow to begin”)
- Rainbow / teal / violet blooms or black circular glyphs
- Dark glass hero that breaks blue CTA contrast
- Nesting `/create` steps inside the cloud
- Fake work-order metrics as the hero visual
- Interactive orb on `/create`
- Fake live-call UI, always-on phone, fabricated social proof
- Recolouring semantic warn/status chips to brand blue
- Blue-filled wordmark / logo
