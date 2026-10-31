# Plan: mw-293-admin-prelaunch-honesty

1. Confirm `src/app/admin/page.tsx` reads live `siteConfig` flags.
2. Confirm `robots: { index: false, follow: false }`.
3. Confirm `/admin/` excluded from marketingPaths.
4. Run `scripts/admin-honesty.test.mjs` + full test suite.
