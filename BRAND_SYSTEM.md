# Brand System v0.3 — warm paper, blue accent

**Status:** Design council lock 2026-09-22, **Local owner override 2026-09-23** (atmosphere only). Visual Design Council soft-cleared RelicVault-like warmth with locked paper `#F8FAFC`, accent `#1D4ED8`, and a labelled UNDER TEST shell **below** the hero. Local asked for photographic, human, moving — not clinical B-flat chrome.  
**Source of truth for tokens:** `src/app/globals.css` (mirrored in `docs/ui-preview/tokens.css`).  
**Companion:** `UI_VISUAL_SYSTEM.md`.

## Public naming

- Master brand: **WorkSmartOS** (one word; never “WorkSmart OS”). Andy Cartwright, 13 Oct 2026: WorkSmartOS is the brand. MaintenanceOS is only a product under it.
- Product on this site: **MaintenanceOS**, framed as WorkSmartOS MaintenanceOS. ReceptionistOS is coming soon and is not live. Do not add a route for it.
- Public/search identity: **WorkSmartOS**
- Publisher: **Chapelgate**
- Category descriptor: **UK maintenance operations software with AI-assisted intake**
- Site wordmark, title suffix, and `og:site_name` are **WorkSmartOS**. Page titles end `| WorkSmartOS`. The footer line is “WorkSmartOS by Chapelgate Technologies”.
- Use the product name inside product copy. The registered company name stays Chapelgate Limited in the footer copyright line and legal pages (Andy Cartwright, 10 Oct 2026: “by Chapelgate” stays off the logo and out of titles).
- Do not drift between `Chapelgate` and `Chapelgate Technologies` on this site unless a separate approved naming decision changes the publisher identity. The footer attribution “WorkSmartOS by Chapelgate Technologies” is the approved exception, next to the Chapelgate Limited copyright.

Discoverability baseline and monitoring queries: [`docs/SEO_BRAND_BASELINE_2026-09-25.md`](docs/SEO_BRAND_BASELINE_2026-09-25.md).

## Intent

UK maintenance operations product on **light paper**. Blue `#1D4ED8` is the brand accent (CTAs, focus rings — louder than photos/motion). Orb glow is a single blue hue (`#3B82F6` → sky → white). The orb is a **secondary “intake listening” cue** on a paper hero stage (sized to the old photo footprint) plus restrained band accents — not the brand mark and not a conversion control. The wordmark stays **flat ink** — no blue logo fill.

Locked public CTAs stay primary: **Create from website** (`/create/`), **Join launch list**, **Request early demo / access**. Do not put those inside the orb or sit an orb above the `/create` URL field. Do not park the orb on a luxury terrace photograph.

## Colour

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#0F172A` | Body text and wordmark (AA on paper/surface) |
| Muted | `#475569` | Secondary text |
| Paper | `#F8FAFC` | Page canvas (council lock — warmth is photographic, not a recolour) |
| Surface | `#FFFFFF` | Cards, ops glass fill |
| Line | `#E2E8F0` | Thin borders |
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
