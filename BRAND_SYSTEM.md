# Brand System v0.3 — warm paper, blue accent

**Status:** Design council lock 2026-09-22, **Local owner override 2026-09-23**. Visual Design Council direction **B** (blue accent + labelled UNDER TEST shell) stays. Local asked for RelicVault-*like* warmth: photographic, human, moving — not a clinical B-flat SaaS chrome.  
**Source of truth for tokens:** `src/app/globals.css` (mirrored in `docs/ui-preview/tokens.css`).  
**Companion:** `UI_VISUAL_SYSTEM.md`.

## Intent

UK maintenance operations product on **warm linen paper**. Blue `#1D4ED8` is the brand accent (CTAs, focus rings). Orb glow is a single blue hue (`#3B82F6` → sky → white). The orb is a **secondary “intake listening” cue** on the home hero visual — not the brand mark and not a conversion control. The wordmark stays **flat ink** — no blue logo fill.

Locked public CTAs stay primary: **Create from website** (`/create/`), **Join launch list**, **Request early demo / access**. Do not put those inside the orb or sit an orb above the `/create` URL field.

## Colour

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#0F172A` | Body text and wordmark (AA on paper/surface) |
| Muted | `#57534E` | Secondary text (warmer stone) |
| Paper | `#F3EEE4` | Warm linen page canvas — still light for blue CTA AA |
| Surface | `#FFFAF4` | Cards, ops glass fill |
| Line | `#E6DFD2` | Thin borders |
| Accent | `#1D4ED8` | CTA fill + focus rings — white label ≥4.5:1 |
| Accent hover | `#1E40AF` | CTA hover (AA) |
| Accent subtle | `#DBEAFE` | Soft blue wash |
| On-accent | `#FFFFFF` | Label on accent buttons |

Glow stops (orb / hero wash only): `#3B82F6` → `#60A5FA` → `#EFF6FF`. **Reject** amber/peach *glows*, teal, violet, rainbow Siri blooms, black circular glyphs, and RelicVault constellation/night-sky chrome. Warmth is paper + photography, not a peach accent.

Functional colours: ok `#15803D`, warn `#92400E` (warm amber-family — do not recolour status/warn chips to blue), critical `#B91C1C`, info `#0369A1` (moved off `#1D4ED8` so it does not collide with accent). Never colour-only.

## Type

Inter 400 / 600 only (`next/font`, `display: swap`, latin). No extra families without Performance + Brand sign-off.

## Voice / claims

No live-phone chrome, no fake metrics, no social proof theatre. Copy stays claims-safe (`PRODUCT_CLAIMS_REGISTER.md`).
