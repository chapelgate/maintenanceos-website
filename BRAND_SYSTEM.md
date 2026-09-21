# Brand System v0.2 — luminous dusk

**Status:** marketing site visual language (2026-09-21). Replaces flat amber/paper v0.1.  
**Source of truth for tokens:** `src/app/globals.css` (mirrored in `docs/ui-preview/tokens.css`).  
**Companion:** `UI_VISUAL_SYSTEM.md`.

## Intent

MaintenanceOS should feel like a premium, near-future operations product — **Apple Intelligence / Siri-inspired**, not a dated SaaS card grid and not a parody Siri logo.

The signature interaction is a **soft glowing orb** that, when pressed, expands into a **frosted-glass “cloud” panel** with the honest primary action.

## Colour

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#0B1220` | Body text on light glass/paper |
| Muted | `#475569` | Secondary text (AA on paper) |
| Paper | `#EEF2F8` | Cool page canvas (luminous washes in CSS) |
| Surface | `#FFFFFF` | Opaque fallback |
| Accent | `#B45309` | Functional CTA fill — **keep**; white label ≥4.5:1 |
| Accent hover | `#9A3412` | CTA hover (AA) |
| On-accent | `#FFFFFF` | Label on accent buttons |
| Dusk | `#0B1224` | Hero / footer / banner canvas |
| On-dusk | `#F8FAFC` | Text on dusk |
| On-dusk muted | `#CBD5E1` | Secondary text on dusk |
| Accent luminous | `#F5C16C` | Labels/links **on dusk only** |

Atmospheric glows (orb / hero, not body text): teal `#5EEAD4`, violet `#C4B5FD`, amber `#FBBF24`, cyan `#7DD3FC`.

Functional colours are unchanged: ok `#15803D`, warn `#92400E`, critical `#B91C1C`, info `#1D4ED8`. Never colour-only.

Do **not** regress to flat amber-on-paper cards as the default chrome. Amber remains a luminous accent among cool glows, and the solid CTA fill for contrast.

## Type

Inter 400 / 600 only (`next/font`, `display: swap`, latin). Slightly tighter headings (`letter-spacing: -0.02em`, `ss01`). No extra families without Performance + Brand sign-off.

## Voice / claims

Visual modernity must not invent product readiness. No live-phone chrome, no fake metrics, no social proof theatre. Copy stays claims-safe (`PRODUCT_CLAIMS_REGISTER.md`).
