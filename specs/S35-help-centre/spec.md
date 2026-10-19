# S35 — Help Centre (MDX in Repo)

## Slice ID
S35

## Title
Help centre at `/help/` with MDX in repo, searchable, versioned

## Goal
20+ articles searchable; no external dependency

## Acceptance Criteria
- `/help/` index page loads with all articles grouped by category
- Client-side search filters articles in real-time
- Each article at `/help/<slug>/` renders with full content, metadata, breadcrumbs
- JSON-LD structured data (WebPage + BreadcrumbList) on all help pages
- Sitemap includes `/help/` and all 26 article URLs with lastmod
- Robots.txt allows AI bots (already verified)
- Build passes, TypeScript clean, lint clean, tests pass
- 26 help articles covering: Getting Started, Configuration, Core Concepts, Safety & Compliance, Compliance, Daily Operations, Features, Integrations, Reports, Account & Billing, Security & Privacy, Troubleshooting, Support, Product Updates

## Files Created/Modified
- `src/content/help/*.mdx` (26 articles)
- `src/lib/help.ts` (library)
- `src/lib/help.test.ts` (tests)
- `src/app/help/page.tsx` (index)
- `src/app/help/[slug]/page.tsx` (article)
- `src/config/routes.ts` (routes)
- `src/app/sitemap.ts` (sitemap)

## Dependencies
- S17 (sitemap lastmod) — merged
- S24 (blog MDX pattern) — merged