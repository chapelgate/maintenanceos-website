# S22 — Comparison Pages Tasks

## Task List

### Phase 1: Research & Content Collection
- [ ] Research Fixflo public site — collect verifiable claims with URLs
- [ ] Research Moneypenny public site — collect verifiable claims with URLs
- [ ] Research AnswerConnect public site — collect verifiable claims with URLs
- [ ] Research Fasthosts public site — collect verifiable claims with URLs
- [ ] Research Dialzara public site — collect verifiable claims with URLs
- [ ] Research Rosie public site — collect verifiable claims with URLs
- [ ] Research Goodcall public site — collect verifiable claims with URLs
- [ ] Research Phena public site — collect verifiable claims with URLs

### Phase 2: Content Files
- [ ] Create `src/content/compare/fixflo.mdx`
- [ ] Create `src/content/compare/moneypenny.mdx`
- [ ] Create `src/content/compare/answerconnect.mdx`
- [ ] Create `src/content/compare/fasthosts.mdx`
- [ ] Create `src/content/compare/dialzara.mdx`
- [ ] Create `src/content/compare/rosie.mdx`
- [ ] Create `src/content/compare/goodcall.mdx`
- [ ] Create `src/content/compare/phena.mdx`

### Phase 3: Library & Components
- [ ] Create `src/lib/compare.ts` — load and validate comparison content
- [ ] Add comparison page metadata helper to `src/lib/page-meta.ts` (or reuse contentPageMetadata)
- [ ] Add comparison JSON-LD helper to `src/lib/json-ld.ts` (or reuse contentPageJsonLd)

### Phase 4: Page Route
- [ ] Create `src/app/compare/[slug]/page.tsx` — dynamic route
- [ ] Add breadcrumb support for compare pages in json-ld

### Phase 5: Navigation & Linking
- [ ] Add "Compare" link to footer navigation (Company section)
- [ ] Verify all 8 pages accessible and linked

### Phase 6: Verification
- [ ] Run `npm ci`
- [ ] Run `npx tsc --noEmit`
- [ ] Run `npm run lint`
- [ ] Run `npm run build`
- [ ] Run `npm test`
- [ ] Local verification: visit each `/compare/worksmartos-vs-{slug}/` page
- [ ] Verify JSON-LD output (single block, BreadcrumbList present)
- [ ] Verify Lighthouse scores locally (or note for live check)

### Phase 7: PR & Merge
- [ ] Commit changes
- [ ] Push branch
- [ ] Open PR with required Estate-Preflight headers
- [ ] Wait for CI (estate-gate, validate, webkit-a11y)
- [ ] Merge with `gh pr merge --squash`
- [ ] Update IMPL_STATE.md with PR number and SHA
- [ ] Live acceptance check against https://worksmartos.co.uk