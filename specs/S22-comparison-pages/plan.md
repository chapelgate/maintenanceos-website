# S22 — Comparison Pages Implementation Plan

## Approach
Create a dynamic route `[slug]` under `/compare/` that reads from MDX content files. Each competitor gets an MDX file with structured frontmatter and comparison content.

## File Structure
```
src/
├── app/
│   └── compare/
│       └── [slug]/
│           └── page.tsx          # Dynamic route page
├── content/
│   └── compare/
│       ├── fixflo.mdx
│       ├── moneypenny.mdx
│       ├── answerconnect.mdx
│       ├── fasthosts.mdx
│       ├── dialzara.mdx
│       ├── rosie.mdx
│       ├── goodcall.mdx
│       └── phena.mdx
└── lib/
    └── compare.ts                # Helper to load and validate comparison content
```

## Implementation Steps

### 1. Create content/compare MDX files (8 files)
Each MDX file contains:
- Frontmatter with competitor metadata (name, slug, category, website, sourceUrls)
- Structured comparison data as typed objects
- Sources/citations section

### 2. Create lib/compare.ts
- Load comparison content by slug
- Validate required fields
- Generate metadata for SEO
- Generate JSON-LD for the page

### 3. Create app/compare/[slug]/page.tsx
- Dynamic route using Next.js App Router
- Generate metadata using contentPageMetadata
- Render PageHero, comparison table, sources
- Include JsonLd with contentPageJsonLd
- Handle 404 for unknown slugs

### 4. Add comparison page link to footer or navigation
- Decide where to link from (footer company section or new compare section)

### 5. Verify build, lint, tests pass
- `npm run build`
- `npx tsc --noEmit`
- `npm run lint`
- `npm test`

### 6. Test locally
- Verify each page renders correctly
- Check JSON-LD output
- Verify breadcrumbs

## Comparison Dimensions (Verifiable)
For each competitor, document only what is publicly verifiable:

| Dimension | WorkSmartOS MaintenanceOS | Competitor |
|-----------|---------------------------|------------|
| Product type | Pre-launch software (AI + rules) | [From public site] |
| AI capability | Structured intake + safety latches | [From public site] |
| Safety architecture | Human-in-the-loop, fixed rules, latches | [From public site] |
| Data processing | UK-only, no client money, transparent subprocessors | [From public site] |
| Pricing | Not published (pre-launch) | [From public site] |
| UK-specific | Companies House integration, UK regulations | [From public site] |
| Availability | Pre-launch, early access only | [From public site] |

## Source Collection
For each competitor, visit their public website and document:
- Product page claims
- Pricing page (if public)
- Features page
- About/Company page
- Terms/Privacy for data processing claims
- Record URL and access date for each claim

## Quality Gates
- All claims cited with public URLs
- No ESTIMATE/UNVERIFIED claims without clear labeling
- Lighthouse ≥ 90 (performance, accessibility, best practices, SEO)
- Rich Results Test passes for WebPage
- Build passes with no TypeScript errors
- All existing tests pass

## Rollback Plan
If issues arise:
- Feature flag the compare routes (environment variable)
- Or remove the route files and content directory