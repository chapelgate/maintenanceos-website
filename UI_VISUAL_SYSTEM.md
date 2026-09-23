# UI Visual System v0.3 — council lock + Local warmth override

**Status:** Design council lock 2026-09-22; **Local owner override 2026-09-23** (RelicVault-*like* atmosphere: warm, human, photographic, moving).  
**Do not** make the orb the brand mark or the primary conversion control.  
**Do not** invent a dusk / dark-glass / constellation-sky theme. If frost kills contrast, drop blur first.  
**Do not** fill the wordmark with accent blue — it stays flat ink.  
**Do not** scrape RelicVault images or clone their copy, logo, or chrome.

## Surfaces

- **Paper / surface:** light (`#F8FAFC` / `#FFFFFF`). Home hero stays light so blue CTAs remain WCAG AA. Warmth is licensed photography, not a paper recolour.
- **Ops glass** (`.mos-glass`): surface fill, 1px line (`--mos-line`), **one** `backdrop-filter` layer (≤12px blur), brand `--mos-shadow`, **12px** radius, ink type. Max **two** blur layers on a view (optional orb halo + panel).
- **Page hero** (`.mos-page-hero`): warm surface + blue and cream wash (gradient only, no extra blur).
- **Home atmosphere** (`.mos-hero-atmosphere`): linen canvas + restrained `#DBEAFE` and cream depth. CSS-only; quieter under `prefers-reduced-motion`. Not a dark theme.

Buttons, focus rings, and in-panel links inherit the existing system: `rounded-md`, `bg-accent` / outline secondary, `outline: 2px solid var(--color-accent)`.

## Homepage hero proof (Local owner override, 2026-09-23)

Direction **warm photographic operations** on Direction B tokens (blue accent + labelled UNDER TEST shell). Atmosphere borrowed from RelicVault’s *feel* only — not their brand.

`HomeHeroVisual` is the hero photograph + secondary `SiriOrbCloud`. `HomeLifestyleStrip` sits under the H1 (people/phones, labelled stock). The labelled **UNDER TEST** `ProductUiShell` sits **below** the hero as honesty proof. Use `FeatureStatusChip` (outline + mark). No invented metrics, logos, testimonials, live DID, or live-phone theatre.

`SiriOrbCloud` is a **tiny client island** (toggle + Escape + focus into panel + restore) restored as a secondary “intake listening” cue — not the brand mark, not a CTA, not “call the AI”. Create stays the primary control. Do not import the orb on `/create`.

| State | Behaviour |
| --- | --- |
| Idle | Soft `#3B82F6`→sky→white orb; calm morph / drift / glow pulse (CSS-only, secondary) |
| Press / Enter / Space | CSS expand into ops-glass cloud (opacity + transform, 220ms ease) |
| Panel copy | Short honesty + links to `/how-it-works/` and `/create/` |
| Escape | Close; focus returns to the orb button |
| `prefers-reduced-motion: reduce` | Static orb (no morph/pulse); instant open/close for orb and menus; home photo ken-burns and shell float off |

Do **not** nest `CtaPair`, the create funnel, or fake metrics in the glass. No GSAP unless gated on `prefers-reduced-motion: no-preference` (CSS-first is enough).

## `/create`

Light PageHero wash only. **Never** place an orb above the URL field. Do not import the interactive orb. Scan/form wiring (`NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT`) is untouched.

## Chrome

- `SiteHeader` stays a **server** component (`<details>` + inline Escape).
- Wordmark stays flat `text-ink` — no accent fill.
- `CtaPair` stays the primary conversion control on the home hero.
- Banner / footer stay ink-on-paper — not a dusk theme.

## Motion / assets

CSS-first (transform / opacity / filter; no springs). Header `<details>` open/close is 200ms fade+slide. Home photographs use a slow ken-burns only under `prefers-reduced-motion: no-preference`. No WebGL, no paid Higgsfield **hero** assets. Home hero stays video-free. The only approved motion picture is the self-hosted click-to-play tour on `/how-it-works/#product-tour` (`public/media/`, regenerate with `npm run product-tour`; remux Desmond VO with `npm run product-tour:remux`). Client island must stay ≤ ~15–20 kB gz. No GSAP unless gated on `prefers-reduced-motion: no-preference`. Licensed home stills live in `public/media/home/` (see `SOURCES.md`).

## Anti-patterns

- Orb as logo or primary CTA (“press the glow to begin”)
- Rainbow / teal / violet blooms or black circular glyphs
- Dark glass hero that breaks blue CTA contrast
- Nesting `/create` steps inside the cloud
- Fake work-order **metrics** as the hero visual (a labelled UNDER TEST shell is required)
- Interactive orb on `/create`
- Fake live-call UI, always-on phone, fabricated social proof
- Recolouring semantic warn/status chips to brand blue
- Blue-filled wordmark / logo
