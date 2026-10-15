# Specification: Canonical Origin Switch to worksmartos.co.uk

## Objective
Switch the site canonical origin, default site URL fallback, metadataBase, canonical link tags, Open Graph / Twitter URLs, sitemap.xml, robots.txt, and JSON-LD URLs to `https://worksmartos.co.uk` (no trailing slash).

## Context & Background
- The marketing site is live at the new primary domain `https://worksmartos.co.uk` (with `www.worksmartos.co.uk` and `https://maintenanceos.chapelgatetechnologies.com` serving as secondary aliases).
- WorkSmartOS is the master brand, with MaintenanceOS as a product under the master brand.
- Corporate contact email remains `info@chapelgatetechnologies.com` and links to the corporate site `chapelgatetechnologies.com` remain unchanged.
- Public page brand copy and legal pages are preserved.

## Acceptance Criteria
- Set the default/fallback for `NEXT_PUBLIC_SITE_URL` and `FALLBACK_SITE_URL` in `src/lib/site-url.ts` to `https://worksmartos.co.uk` with no trailing slash.
- Set `INTENDED_PRODUCTION_SITE_URL` in `src/lib/site-url.ts` to `https://worksmartos.co.uk`.
- Update `.env.example` `NEXT_PUBLIC_SITE_URL` to `https://worksmartos.co.uk` with a comment noting `maintenanceos.chapelgatetechnologies.com` and `www.worksmartos.co.uk` are aliases.
- Update public URLs in `public/llms.txt` and `public/llms-full.txt` to `https://worksmartos.co.uk`.
- Update origin fallbacks in monitoring and verification scripts under `scripts/*.mjs`.
- Update test assertions in `scripts/canonical-url.test.mjs`, `scripts/council-decisions.test.mjs`, and `scripts/seo-discoverability.test.mjs`.
- Add test assertions that the old origin `https://maintenanceos.chapelgatetechnologies.com` does not appear in the built `sitemap.xml` or `robots.txt` canonical lines.
- Built canonical link, og:url, sitemap.xml locs, robots.txt Host and Sitemap lines, and JSON-LD URLs all use `https://worksmartos.co.uk`.
- Keep all existing tests passing and ensure a clean static export build.
