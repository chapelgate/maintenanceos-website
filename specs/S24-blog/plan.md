# S24 Implementation Plan

## Approach
Follow existing content patterns in the codebase (compare pages) to implement blog with MDX, RSS, and sitemap integration.

## Steps

### 1. Content Layer
- Create `src/content/blog/` directory
- Add 5 MDX files with frontmatter (slug, title, description, date, author, tags, category)
- Use `gray-matter` for frontmatter parsing (existing dependency)

### 2. Data Library
- Create `src/lib/blog.ts` with:
  - `getBlogPostBySlug(slug)` — load single post
  - `getAllBlogPosts()` — load all posts sorted by date desc
  - `getBlogPostSlugs()` — return slugs for static generation
  - `generateBlogMetadata(post)` — SEO metadata helper

### 3. Pages
- `src/app/blog/page.tsx` — blog index with post cards, JSON-LD (WebPage + BreadcrumbList)
- `src/app/blog/[slug]/page.tsx` — individual post with content rendering, JSON-LD (WebPage + BreadcrumbList)
- `src/app/blog/rss.xml/route.ts` — RSS 2.0 feed with atom:link self-reference

### 4. Sitemap Integration
- Update `scripts/generate-sitemap.ts`:
  - Add `getAllBlogSlugs()` function
  - Add blog paths to `pathToFile` mapping
  - Add blog paths to `getMarketingPaths()`
- Update `src/app/sitemap.ts`:
  - Import `getBlogPostSlugs` from blog lib
  - Add blog paths to `getLastModForPath` mapping
- Update `src/config/routes.ts`:
  - Import `getBlogPostSlugs`
  - Add `/blog/` and `/blog/<slug>/` to `marketingPaths`

### 5. Verification
- Run `npm ci`
- Run `npx tsc --noEmit`
- Run `npm run lint`
- Run `npm test`
- Run `npm run build`
- Verify sitemap.xml includes blog URLs
- Verify RSS feed validity
- Verify blog pages render with JSON-LD

## Rollback
If any step fails, revert changes to the 7 modified/created files and the 5 content files.