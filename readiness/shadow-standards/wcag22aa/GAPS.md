# Gaps — WCAG 2.2 Level A + AA

Each gap below is a free fix (no spend, no sign-up) with an owner job. Source: release-standards-council-20261114 item 21 (WCAG 2.2 AA for all 12 web-facing products).

| # | Gap | Free fix | Owner job | Product | Status |
|---|-----|----------|-----------|---------|--------|
| G01 | No automated axe-core/pa11y evidence on disk for any product | Add axe-core CI workflow to all 12 product repos; run on PR merge | DevOps | All 12 web | OPEN |
| G02 | Accessibility statement not published (PSBAR 2018 / GOV.UK model) | Draft accessibility statement template in `/docs/accessibility-statement.md` per product; Andy/legal reviews and publishes | Product owner / Andy | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G03 | Screen reader support not verified (NVDA/VoiceOver) | Add manual screen reader test to operating rhythm; run NVDA/VoiceOver on all product UIs | QA / Accessibility | All 12 web | OPEN |
| G04 | Keyboard navigation completeness not verified | Add keyboard-only navigation test to operating rhythm; Tab through all pages on all products | QA / Accessibility | All 12 web | OPEN |
| G05 | Colour contrast not verified at component level | Run automated contrast check (axe/pa11y) on all product pages; fix any failures | Frontend engineering | All 12 web | OPEN |
| G06 | Focus visible / focus not obscured not verified | Add `:focus-visible` and `scroll-margin` verification to test suite | Frontend engineering | All 12 web | OPEN |
| G07 | Target size (2.5.8) not verified | Add 24×24px minimum target size check to CI | Frontend engineering | All 12 web | OPEN |
| G08 | Language of parts (3.1.2) not verified for Welsh content | Add `lang` attribute audit for Welsh/English content | Content / Localisation | 02, 03, 04, 05, 06, 09, 10, 11, 12 | OPEN |
| G09 | Error suggestion (3.3.3) coverage incomplete | Add validation error suggestion audit to form components | Product engineering | All web with forms | OPEN |
| G10 | Error prevention (3.3.4) on transactions not verified | Add confirmation-step audit on all transaction flows | Product engineering | 02, 03, 05, 06, 09, 10, 11, 12 | OPEN |
| G11 | Status messages (4.1.3) not verified for live regions | Add `aria-live`/`role="status"` coverage audit | Frontend engineering | All 12 web | OPEN |
| G12 | Consistent help (3.2.6) location not audited | Verify help links appear in same relative order on all pages | Frontend engineering | All 12 web | OPEN |
| G13 | Redundant entry (3.3.7) not audited across multi-step forms | Audit multi-step flows for auto-population of previously entered data | Product engineering | All web with forms | OPEN |
| G14 | Accessible authentication (3.3.8) alternatives not universal | Ensure password fields allow paste/autofill; document alternative login methods | Auth engineering | 02, 03, 05, 06, 09, 10, 11, 12 | OPEN |
| G15 | Heading hierarchy (1.3.1, 2.4.6) not audited | Add heading order audit (h1-h6 sequence) to CI | Frontend engineering | All 12 web | OPEN |
| G16 | Link purpose in context (2.4.4) not audited | Add descriptive link text / aria-label audit | Frontend engineering | All 12 web | OPEN |
| G17 | Multiple ways (2.4.5) not verified | Verify navigation + search + sitemap on all products | Product engineering | All 12 web | OPEN |
| G18 | Orientation (1.3.4) not tested | Test portrait/landscape on all product pages | QA | All 12 web | OPEN |
| G19 | Input purpose (1.3.5) autocomplete coverage incomplete | Audit all user info fields for autocomplete attributes | Frontend engineering | All web with forms | OPEN |
| G20 | Text spacing (1.4.12) not tested | Test user text-spacing overrides at 200% zoom | QA | All 12 web | OPEN |
| G21 | Content on hover/focus (1.4.13) dismissible/hoverable/persistent not tested | Test all tooltips/popovers for dismissible/hoverable/persistent | QA | All 12 web | OPEN |

## Notes
- No evidence = GAP. All statuses above are GAP until real scanner/repo evidence is on disk.
- Free fixes only: no paid audit, no certification, no sign-ups.
- Bigger gaps (axe-core CI on all 12 repos, screen reader test automation) get follow-up tasks in out/FOLLOWUPS.md.
- Partially-met criteria (32) in SHADOW-TEMPLATE.md become GAPs when evidence is not on disk; moving to PARTIAL requires axe-core/pa11y runs or manual test evidence.
- Accessibility statement (G02) is the only true GAP (not evidence-based); it requires legal sign-off to PUBLISH but the DRAFT is a free fix.