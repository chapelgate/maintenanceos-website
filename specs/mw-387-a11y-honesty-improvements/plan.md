# mw-387: Accessibility honesty improvements — Plan

## Scope
1. Update help article `/help/accessibility-features.mdx` to reference `/accessibility/` page with matching scope language
2. Add test `scripts/a11y-page-scope.test.mjs` — validates accessibility page route list matches `tests/webkit-a11y/a11y.test.mjs` pages array
3. Add test `scripts/a11y-help-claims.test.mjs` — validates help articles contain no WCAG 2.2 AA claim when publicLaunch=false

## Steps
1. Edit `src/content/help/accessibility-features.mdx`: change first paragraph to include link to `/accessibility/` page and adopt "Not verified" language matching
2. Add test `scripts/a11y-page-scope.test.mjs`: parse a11y.test.mjs pages array, compare with `/accessibility/` page's route descriptions, assert they match
3. Add test `scripts/a11y-help-claims.test.mjs`: parse all `/help/*.mdx` files, assert none contain "WCAG 2.2 AA" or "WCAG 22" or "AA conformance" or "AA certified" claims while publicLaunch=false env is set
4. Run npm test, lint, typecheck, build verification

## Dependencies
None — purely content/markdown and test additions.

## Risks
Low — no code changes, only markdown/test additions. Must ensure existing axe gate behavior is unchanged.