# Project state

Verified 2026-10-12 in source. The live static site is
`https://seahorse-app-4oasq.ondigitalocean.app/`. A merge to `main` rebuilds
it through the existing App Platform auto-deploy path.

## Current verified state

- This repository is the MaintenanceOS marketing website: Next.js static export
  on DigitalOcean App Platform. `output: "export"` and `trailingSlash: true`
  are set. A trailing-slash 301 is not available from `next.config` without a
  platform change, because static export does not apply `redirects()`.
- The Scanner V2 droplet (`178.128.171.45`) and the golden phone line are
  outside a website merge. Shipping package source does not redeploy the droplet.
- `npm test` passes (script tests plus the TypeScript package and `src/lib` tests).
- MP-01 through MP-09, MP-11, and MP-12 are fixed in the website client as
  recorded in `MASTER_PROBLEMS.md`. MP-10 still waits on a production domain.
  MP-07 remains partial: the braces advisory has no safe non-major fix.
- MP-13, MP-14, and MP-15 record the pricing/`llms.txt` copy, the features
  honesty count, and the remaining public audit slices. Those are fixed in
  source. Live HTML follows each merge's static deploy.
- Online enquiries stay on the mailto fallback to andy@chapelgatehome.uk
  until a working lead endpoint is configured. The lead form is not shown
  while that fallback is active.
- Canonical, Open Graph, and sitemap URLs use the staging host because no
  production domain has been chosen.
- The product-tour soundtrack is committed Higgsfield Seed Audio, voice Desmond.
  It is not the phone voice.

## Next step

NVIDIA /oc output on this repo requires Cursor acceptance. UI slices route to
Cursor after 3 demonstrated /oc failures. HB-004, HB-005, and HB-006 stay open.
