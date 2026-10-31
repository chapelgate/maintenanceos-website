# Spec: mw-293-admin-prelaunch-honesty

## Goal
Admin page at `/admin/` with live `siteConfig` flag display, honesty gates list, and pre-launch integrity.

## Acceptance
- `/admin/` renders live flag values from `siteConfig`
- `robots: { index: false, follow: false }` in page metadata
- `/admin/` absent from `marketingPaths` in `src/config/routes.ts`
- No live customer/production metric claims
- No WCAG 2.2 AA verified claim
- `scripts/admin-honesty.test.mjs` passes
