# UI Visual System v0.2 — council lock

**Status:** Design council lock, 2026-09-21.  
**Do not** make the orb the brand mark or the primary conversion control.  
**Do not** invent a dusk / dark-glass theme. If frost kills contrast, drop blur first.

## Surfaces

- **Paper / surface:** light (`#F8FAFC` / `#FFFFFF`). Home hero stays light so amber CTAs remain WCAG AA.
- **Ops glass** (`.mos-glass`): surface fill, 1px line (`--mos-line`), **one** `backdrop-filter` layer (≤12px blur), brand `--mos-shadow`, **12px** radius, ink type. Max **two** blur layers on a view (orb halo + panel).
- **Page hero** (`.mos-page-hero`): light surface + a single amber cream wash (gradient only, no extra blur).

Buttons, focus rings, and in-panel links inherit the existing system: `rounded-md`, `bg-accent` / outline secondary, `outline: 2px solid var(--color-accent)`.

## Orb → cloud (homepage only)

`SiriOrbCloud` is a **tiny client island** (toggle + Escape + focus into panel + restore). Secondary affordance: **intake listening**.

| State | Behaviour |
| --- | --- |
| Idle | Soft amber→peach→cream orb; calm pulse only |
| Press / Enter / Space | CSS expand into ops-glass cloud |
| Panel copy | Short honesty + links to `/how-it-works/` and `/create/` |
| Escape | Instant close; focus returns to the orb button |
| `prefers-reduced-motion: reduce` | No idle pulse; instant open/close |

Do **not** nest `CtaPair`, the create funnel, or fake metrics in the glass. No GSAP unless gated on `prefers-reduced-motion: no-preference` (CSS-first is enough).

## `/create`

Light PageHero wash only. **Never** place an orb above the URL field. Do not import the interactive orb. Scan/form wiring (`NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT`) is untouched.

## Chrome

- `SiteHeader` stays a **server** component (`<details>` + inline Escape).
- `CtaPair` stays the primary conversion control on the home hero.
- Banner / footer stay ink-on-paper as on main — not a dusk theme.

## Motion / assets

CSS-first. No WebGL, no video, no paid Higgsfield hero assets. Client island must stay ≤ ~15–20 kB gz.

## Anti-patterns

- Orb as logo or primary CTA (“press the glow to begin”)
- Rainbow / cyan / violet blooms or black circular glyphs
- Dark glass hero that breaks amber CTA contrast
- Nesting `/create` steps inside the cloud
- Fake work-order metrics as the hero visual
- Interactive orb on `/create`
- Fake live-call UI, always-on phone, fabricated social proof
