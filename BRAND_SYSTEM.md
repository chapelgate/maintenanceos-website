# Brand System v0.2 — light paper, amber accent (council lock)

**Status:** Design council lock, 2026-09-21.  
**Source of truth for tokens:** `src/app/globals.css` (mirrored in `docs/ui-preview/tokens.css`).  
**Companion:** `UI_VISUAL_SYSTEM.md`.

## Intent

Premium operations product on **light paper**. Amber `#B45309` is the only glow hue (amber → peach → cream). The orb is a **secondary “intake listening” cue**, not the brand mark and not a conversion control.

Locked public CTAs stay primary: **Create from website** (`/create/`), **Join launch list**, **Request early demo / access**. Do not put those inside the orb or sit an orb above the `/create` URL field.

## Colour

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#0F172A` | Body text (AA on paper/surface) |
| Muted | `#475569` | Secondary text |
| Paper | `#F8FAFC` | Page canvas |
| Surface | `#FFFFFF` | Cards, ops glass fill |
| Line | `#E2E8F0` | Thin borders |
| Accent | `#B45309` | CTA fill + glow root — white label ≥4.5:1 |
| Accent hover | `#9A3412` | CTA hover (AA) |
| Accent subtle | `#FEF3C7` | Soft peach/cream wash |
| On-accent | `#FFFFFF` | Label on accent buttons |

Glow stops (orb / hero wash only): `#B45309` → `#F5C16C` → `#FFFBEB`. **Reject** cyan, violet, rainbow Siri blooms, and black circular glyphs.

Functional colours unchanged: ok `#15803D`, warn `#92400E`, critical `#B91C1C`, info `#1D4ED8`. Never colour-only.

## Type

Inter 400 / 600 only (`next/font`, `display: swap`, latin). No extra families without Performance + Brand sign-off.

## Voice / claims

No live-phone chrome, no fake metrics, no social proof theatre. Copy stays claims-safe (`PRODUCT_CLAIMS_REGISTER.md`).
