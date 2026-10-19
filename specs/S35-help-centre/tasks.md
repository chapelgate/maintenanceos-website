# Tasks — S35 Help Centre

## Completed
- [x] Create `src/content/help/` directory
- [x] Create 26 MDX help articles
- [x] Create `src/lib/help.ts` library
- [x] Create `src/lib/help.test.ts` tests (9 tests passing)
- [x] Create `src/app/help/page.tsx` index page with search
- [x] Create `src/app/help/[slug]/page.tsx` article page
- [x] Update `src/config/routes.ts` with help routes
- [x] Update `src/app/sitemap.ts` with help paths
- [x] Run `npm ci` — passed
- [x] Run `npx tsc --noEmit` — passed
- [x] Run `npm run lint` — passed (pre-existing warnings only)
- [x] Run `npm test` — passed (278 pass, 2 pre-existing failures)
- [x] Run `npm run build` — passed (88 pages generated including 27 help pages)

## Verification
- All 26 help articles render at `/help/<slug>/`
- Help index at `/help/` loads with category grouping
- Client-side search filters in real-time
- JSON-LD structured data present on all help pages
- Sitemap includes `/help/` and all article URLs
- Build output shows 27 help routes (1 index + 26 articles)

## Next Steps
- [ ] Commit changes
- [ ] Push to origin
- [ ] Create PR with estate-gate preflight
- [ ] Wait for CI (estate-gate, validate, webkit-a11y)
- [ ] Merge when all checks green
- [ ] Verify live deployment