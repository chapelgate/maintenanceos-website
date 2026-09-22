# A11y gap audit — MaintenanceOS website

**Date:** 2026-09-18 (BST)  
**Author:** MOS FE A11y Impl  
**Baseline:** `WCAG_22_AA_BASELINE.md` (chapelgate-ops)  
**Contrast:** `CONTRAST_TOKEN_AUDIT.md`  
**Branch:** `feat/fe-a11y`

## P0 in this PR

| Fix | Baseline | Files |
|-----|----------|--------|
| Skip link high-contrast on focus | K8, K2 | `SkipLink.tsx` |
| Sticky header focus not obscured | K5 | `globals.css` |
| `prefers-reduced-motion` | M1 | `globals.css` |
| Escape closes header `<details>`; focus returns to summary | K1 | `SiteHeader.tsx` |
| Targets ≥24×24 CSS px | K7 | `SiteHeader.tsx`, `CtaPair.tsx`, `LeadCaptureForm.tsx` |
| Focus rings 2px accent + offset | K2 | `globals.css` |
| Email labelled “Email (required)”; `aria-invalid` + `aria-describedby` | F1–F4 | `LeadCaptureForm.tsx` |
| Accent hover `#1E40AF` (white label AA; retokened from amber) | C1 | `globals.css` |
| eslint jsx-a11y critical rules + ignore `.next`/`out` | CI | `eslint.config.mjs` |

## P1 remaining

- axe Playwright CI on `/` + form routes once staging exists  
- Full keyboard QA on staging; banner vs sticky focus order  
- Multi-field error summary  
