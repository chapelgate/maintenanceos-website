Plan: Switch canonical origin to https://maintenanceos.chapelgatetechnologies.com across source fallbacks, metadata helpers, robots/sitemap generators, and LLM reference files.

1. Update `FALLBACK_SITE_URL` and production constants in `src/lib/site-url.ts` and `src/config/site.ts`.
2. Update default `NEXT_PUBLIC_SITE_URL` in `.env.example`.
3. Update public URLs in `public/llms.txt` and `public/llms-full.txt`.
4. Update monitoring and verification script origin fallbacks.
5. Update existing test assertions and add test for built canonical/sitemap origin (`scripts/canonical-url.test.mjs`).
6. Run `npm ci`, `npm test`, and `npm run build` to verify clean build and passing tests.
