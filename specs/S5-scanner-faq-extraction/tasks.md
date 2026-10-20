# Tasks: S5 Scanner FAQ Extraction

- [x] Modify `extractDetailsFaqs` to require aria-controls/id linkage for button/div accordions
- [x] Add test: mobile menu with button[aria-expanded] + div is not extracted as FAQs
- [x] Add test: accordion with question-marked buttons and sibling divs extracts as FAQs
- [x] Run tests: `npm test` passes (279 pass, 1 pre-existing piper-http failure)
- [x] Run build: `npm run build` passes
- [x] Run typecheck: `npx tsc --noEmit` passes
- [x] Run lint: `npm run lint` passes (0 errors, 5 pre-existing warnings)
- [x] Create PR with Estate headers
- [x] Wait for CI: estate-gate, validate, webkit-a11y all green
- [x] Merge PR with `gh pr merge --squash`
- [x] Verify live acceptance after deploy