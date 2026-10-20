# S22 — Comparison Pages Tasks

## Task List

### Phase 1: Research & Content Collection
- [x] Research Fixflo public site — collect verifiable claims with URLs
- [x] Research Moneypenny public site — collect verifiable claims with URLs
- [x] Research AnswerConnect public site — collect verifiable claims with URLs
- [x] Research Fasthosts public site — collect verifiable claims with URLs
- [x] Research Dialzara public site — collect verifiable claims with URLs
- [x] Research Rosie public site — collect verifiable claims with URLs
- [x] Research Goodcall public site — collect verifiable claims with URLs
- [x] Research Phena public site — collect verifiable claims with URLs

### Phase 2: Content Files
- [x] Create `src/content/compare/fixflo.mdx`
- [x] Create `src/content/compare/moneypenny.mdx`
- [x] Create `src/content/compare/answerconnect.mdx`
- [x] Create `src/content/compare/fasthosts.mdx`
- [x] Create `src/content/compare/dialzara.mdx`
- [x] Create `src/content/compare/rosie.mdx`
- [x] Create `src/content/compare/goodcall.mdx`
- [x] Create `src/content/compare/phena.mdx`

### Phase 3: Library & Components
- [x] Create `src/lib/compare.ts` — load and validate comparison content
- [x] Add comparison page metadata helper to `src/lib/page-meta.ts` (or reuse contentPageMetadata)
- [x] Add comparison JSON-LD helper to `src/lib/json-ld.ts` (or reuse contentPageJsonLd)

### Phase 4: Page Route
- [x] Create `src/app/compare/[slug]/page.tsx` — dynamic route
- [x] Add breadcrumb support for compare pages in json-ld

### Phase 5: Navigation & Linking
- [x] Add "Compare" link to footer navigation (Company section)
- [x] Verify all 8 pages accessible and linked

### Phase 6: Verification
- [x] Run `npm ci`
- [x] Run `npx tsc --noEmit`
- [x] Run `npm run lint`
- [x] Run `npm run build`
- [x] Run `npm test`
- [x] Local verification: visit each `/compare/worksmartos-vs-{slug}/` page
- [x] Verify JSON-LD output (single block, BreadcrumbList present)
- [x] Verify Lighthouse scores locally (or note for live check)

### Phase 7: PR & Merge
- [x] Commit changes
- [x] Push branch
- [x] Open PR with required Estate-Preflight headers
- [x] Wait for CI (estate-gate, validate, webkit-a11y)
- [x] Merge with `gh pr merge --squash`
- [x] Update IMPL_STATE.md with PR number and SHA
- [x] Live acceptance check against https://worksmartos.co.uk