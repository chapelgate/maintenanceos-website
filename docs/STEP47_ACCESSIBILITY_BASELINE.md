# Step 47 — accessibility verification

Date: 2026-09-25
Owner: MOS Website Manager
Scope: WCAG 2.2 AA-oriented automated/source baseline for the public website

## Live automated baseline

Official Lighthouse 13.5.0 accessibility audits were run against:

- Home
- Create
- Contact
- Demo
- Pricing
- How it works

All six scored **100**.

The audits nevertheless surfaced a shared zero-weight `label-content-name-mismatch` warning. Root cause: redundant accessible-name overrides on the wordmark while the visible text already supplied the name. The header override was removed first; final live verification then found and removed the same redundant override in the footer.

## WCAG 2.2-oriented controls verified in source

- **2.4.1 Bypass Blocks:** a visible-on-focus “Skip to main content” link targets `#main`.
- **2.4.7 Focus Visible:** links, buttons, inputs, selects, textareas and summaries receive a 2px visible focus outline.
- **2.4.11 Focus Not Obscured (Minimum):** global `scroll-padding-top` and `#main` `scroll-margin-top` account for the sticky header.
- **2.5.8 Target Size (Minimum):** shared CTAs are 44px high; header/menu controls are 36px+ and exceed the 24px AA minimum baseline.
- **Reduced motion:** `prefers-reduced-motion: reduce` collapses animations/transitions and disables decorative motion.
- **Language:** root document is `en-GB`.
- **Images:** source/build regression checks require `alt` on every `img`.
- **Forms:** existing labelled form controls remain covered by the create-flow tests and Lighthouse live audits.
- **Colour contrast:** Lighthouse reports no contrast failures on the audited journeys; the locked accent/on-accent tokens were already designed to AA contrast.
- **Keyboard menu escape:** the native-details header closes on Escape and restores focus to the summary.

## Durable checks

`scripts/site-accessibility.test.mjs` is included in the normal test suite and may also be run directly through:

```bash
npm run accessibility:check
```

It protects the skip link, focus offsets, focus styling, reduced motion, target-size baseline, wordmark accessible name, document language/main landmark, and image alternatives.

## Evidence boundary

Automated tooling and source inspection cannot certify every WCAG 2.2 success criterion or substitute for a specialist accessibility audit with assistive technologies. Step 47 establishes a strong verified engineering baseline and fixes every issue found by the live automated audits. It does **not** claim third-party certification.

## Reuse / spend

Existing accessibility controls and tests were reused. Lighthouse was used one-off from the official npm package and was not added to dependencies. No paid accessibility scanner, browser service, new app, or runner was created.

## Final live verification

PR #96 merged as `c780f12ec51aa1d93bcb998be10edd5e8ff55a1f`. Cache-bypassed live HTML contains zero `aria-label="MaintenanceOS by Chapelgate"` occurrences. Lighthouse 13.5.0 re-audits on Home and Contact both score **100**, with **0** `label-content-name-mismatch` items. The dedicated accessibility gate, full test suite, and production build all pass.
