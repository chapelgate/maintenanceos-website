# Project state

Verified 2026-10-11 against `main` (`973e57d`) and the live static site
`https://seahorse-app-4oasq.ondigitalocean.app/` (release marker
`15ae5e6c2d8f1ebef3bbbec99532a2706ef07f20`).

## Current verified state

- This repository is the MaintenanceOS marketing website: Next.js static export
  on DigitalOcean App Platform. Merging to `main` rebuilds that static site
  through the existing App Platform auto-deploy path (`MASTER_PROBLEM_LOG.md`,
  `WEBSITE_BACKLOG.md`).
- The Scanner V2 droplet (`178.128.171.45`) and the golden phone line are
  outside this change. A website merge does not redeploy the droplet.
- `npm test` does not exit 0: PDF parser tests are cancelled
  (`standardFontDataUrl` warning, and an unref'd parse timeout lets the test
  runner stop the file).
- A zero-fetch `PARTIAL` scan (live example: a resumed job with `fetched: 0`)
  is treated as an empty draft ("nothing found") because HTTP 200 is accepted
  as success.
- `GasSafetyStrip` is mounted from `src/app/layout.tsx` on every page.
- `/favicon.ico` is missing (live 404).
- Spoken replies on the site use the browser speech API (`src/lib/browser-voice.ts`).
  The accepted golden-line voice in `PRODUCT_CLAIMS_REGISTER.md` (V-01) is
  Gemini / Gacrux. This repo has no website-owned key for that provider.
- The product-tour soundtrack is committed Higgsfield Seed Audio, voice Desmond
  (`scripts/product-tour/README.md`). It is not the phone voice.
- `npm audit` reports high advisories. The suggested `eslint-config-next`
  downgrade to 14.2.35 is a major-version move and is not an approved fix.
- Canonical, Open Graph, and sitemap URLs use the staging host because no
  production domain has been chosen.
- `/about` still describes industry lines as pages under Chapelgate Industries,
  which reads as if those sector products are part of the live site.

## Next step

Apply the approved website-only slices on `cursor/review-fixes-d039`: client
zero-fetch failure, in-repo scanner reseed (droplet deploy stays blocked),
unmount the gas strip, add a favicon, voice fallback behind configuration,
PDF test fix, smallest safe audit upgrades, scan-proxy hardening, and `/about`
wording. Leave the canonical host unchanged.
