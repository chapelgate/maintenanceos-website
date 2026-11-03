# mw-387: Accessibility honesty improvements — Tasks

- [x] Update help article /help/accessibility-features.mdx — add link to /accessibility/ page, remove unsupported WCAG 2.2 AA claim
- [x] Add script a11y-page-scope.test.mjs — validates /accessibility/ page documents all help routes in test matrix
- [x] Add script a11y-help-claims.test.mjs — validates no help article claims WCAG AA while publicLaunch=false
- [x] Fix description meta length in help article (under 160 chars)
- [x] Run npm test (634/634 pass)
- [x] Run npm run lint (clean)
- [x] Run npm run typecheck (clean)
- [x] Run npm run build (green)
- [x] Verify no frozen paths touched
- [x] Verify NEXT_PUBLIC_PUBLIC_LAUNCH remains false