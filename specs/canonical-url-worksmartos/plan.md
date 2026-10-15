Plan: Switch canonical origin to https://worksmartos.co.uk across source fallbacks, metadata helpers, robots/sitemap generators, LLM reference files, and test assertions.

1. Update `FALLBACK_SITE_URL` and `INTENDED_PRODUCTION_SITE_URL` in `src/lib/site-url.ts` and comment in `src/config/site.ts`.
2. Update default `NEXT_PUBLIC_SITE_URL` in `.env.example`, noting aliases in comments.
3. Update public URLs in `public/llms.txt` and `public/llms-full.txt`.
4. Update monitoring and verification script origin fallbacks in `scripts/*.mjs`.
5. Update test assertions in `scripts/canonical-url.test.mjs`, `scripts/council-decisions.test.mjs`, and `scripts/seo-discoverability.test.mjs`.
6. Add test assertions ensuring `https://maintenanceos.chapelgatetechnologies.com` does not appear in built `sitemap.xml` or `robots.txt` canonical lines.
7. Run `npm ci`, `npm test`, and `npm run build` to verify clean build and passing tests.
8. Inspect build output (`out/`) to verify all canonical links, Open Graph tags, sitemap, robots, and JSON-LD reference `https://worksmartos.co.uk`.
