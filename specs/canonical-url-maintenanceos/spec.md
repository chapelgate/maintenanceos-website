# Specification: Canonical Origin Switch to maintenanceos.chapelgatetechnologies.com

## Objective
Switch the site canonical origin, default site URL fallback, metadataBase, canonical link tags, Open Graph / Twitter URLs, sitemap.xml, robots.txt, and JSON-LD URLs to `https://maintenanceos.chapelgatetechnologies.com` (no trailing slash).

## Context & Background
- The marketing website now serves at `https://maintenanceos.chapelgatetechnologies.com` (returns 200).
- Register #28 context: Decision to use the dedicated subdomain `maintenanceos.chapelgatetechnologies.com` for MaintenanceOS marketing while preserving the apex domain for Chapelgate Technologies.
- Legal pages landed in #252 (closed #249): No modifications to legal pages (`/privacy`, `/cookies`, `/terms`), layout, or public page copy.

## Acceptance Criteria
- Set the default/fallback for `NEXT_PUBLIC_SITE_URL` and `FALLBACK_SITE_URL` in `src/lib/site-url.ts` to `https://maintenanceos.chapelgatetechnologies.com` with no trailing slash.
- Update canonical link tags, Open Graph/Twitter URLs, `sitemap.xml`, `robots.txt` sitemap line, and JSON-LD URLs that reference the old origin.
- Update DigitalOcean app spec env value for `NEXT_PUBLIC_SITE_URL` if present in repository (verified: none present).
- Preserve existing page copy, layout, and legal pages.
- Keep all existing tests passing and add a test asserting the built canonical/sitemap origin is the new URL.
