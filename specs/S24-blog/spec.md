# S24 — Blog (MDX, RSS, Auto-sitemap)

## Goal
Add blog at `/blog/` with MDX in `/content/blog`, RSS feed, and auto-sitemap integration for long-tail SEO and "overnight-shippable" content pipeline.

## Acceptance Criteria
- [x] 5 blog posts render at `/blog/` and `/blog/<slug>/`
- [x] RSS feed valid at `/blog/rss.xml` with all posts
- [x] Sitemap includes `/blog/` index and all 5 blog post URLs with `lastmod`
- [x] Build passes (`npm run build` exits 0)
- [x] TypeScript clean (`npx tsc --noEmit` exits 0)
- [x] Lint passes (`npm run lint` exits 0)
- [x] Tests pass (`npm test` - pre-existing failures only)

## Files Created
- `src/content/blog/why-safety-latches-matter-in-ai-receptionists.mdx`
- `src/content/blog/uk-property-maintenance-software-landscape-2026.mdx`
- `src/content/blog/structured-repair-intake-vs-free-text-forms.mdx`
- `src/content/blog/uk-maintenance-regulations-what-property-teams-need-to-know.mdx`
- `src/content/blog/ai-voice-demo-browser-only-what-it-means.mdx`
- `src/lib/blog.ts` — blog post loading and metadata
- `src/app/blog/page.tsx` — blog index page
- `src/app/blog/[slug]/page.tsx` — individual blog post page
- `src/app/blog/rss.xml/route.ts` — RSS 2.0 feed

## Files Modified
- `scripts/generate-sitemap.ts` — added blog slugs and paths
- `src/app/sitemap.ts` — added blog paths to lastmod mapping
- `src/config/routes.ts` — added blog paths to marketingPaths

## Skills Used
- `vercel-react-best-practices` — Next.js App Router static generation patterns
- `web-quality-audit` — sitemap, RSS, structured content verification
- `api-design-principles` — RSS feed structure, content API design
- `observability-and-instrumentation` — build verification, acceptance test evidence

## Verification Evidence
```
Build output shows:
  /blog                                    ○  (Static)
  /blog/[slug]                             ●  (SSG - 5 pages)
  /blog/rss.xml                            ○  (Static)
  out/sitemap.xml contains 6 blog URLs (index + 5 posts)
  out/blog/rss.xml valid RSS 2.0 with 5 items
  out/blog/why-safety-latches-matter-in-ai-receptionists/index.html renders with JSON-LD BreadcrumbList
```

## Dependencies
- S17 (sitemap lastmod infrastructure) — satisfied

## Notes
- All blog posts are claims-safe, sourced, pre-launch honest
- MDX parsed with `gray-matter` (existing dependency)
- No new runtime dependencies added
- Static export compatible (output: "export")