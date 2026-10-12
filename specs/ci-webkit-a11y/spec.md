# CI: Safari engine (WebKit) and accessibility checks on key pages

## Objective
Add one GitHub Actions job with Playwright WebKit, at both iPhone 13 and desktop Safari sizes, plus @axe-core/playwright. Build the static export and serve it locally, then for /, /create/, /demo/, /features/, /pricing/ and /security/:
- assert there are zero axe violations at serious or critical level
- Tab through the page and check that focus is always visible and that the menu opens and closes with Enter and Escape
- check there's no horizontal overflow

Run it on pull requests and on main. Upload an HTML report as an artifact. Reuse the existing Playwright dependency, and add no new services.

## Acceptance Criteria
- [ ] GitHub Actions job runs on pull requests and main
- [ ] Uses Playwright with WebKit
- [ ] Tests at iPhone 13 and desktop Safari viewport sizes
- [ ] Uses @axe-core/playwright to check for accessibility violations
- [ ] Checks pages: /, /create/, /demo/, /features/, /pricing/, /security/
- [ ] Asserts zero axe violations at serious or critical level
- [ ] Tab navigation: focus is always visible
- [ ] Menu opens and closes with Enter and Escape
- [ ] No horizontal overflow
- [ ] Builds static export and serves it locally
- [ ] Uploads HTML report as an artifact
- [ ] Reuses existing Playwright dependency
- [ ] No new services added