# Project state

Verified 2026-10-12 against the live static site
`https://seahorse-app-4oasq.ondigitalocean.app/`. A merge to `main` rebuilds
it through the existing App Platform auto-deploy path.

Final release SHA: `7a6f7f6b58bbbd08b490e6dd551f738700ce418d`
(`/release.json`, built 2026-10-12T03:34:07.332Z).
Rollback point: `e4b4604d861520246ef0999296578fe573523d6b`.

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
  honesty count, and the remaining public audit slices. Those are on the
  live release above.
- MP-16 records the jargon and repetition cut. The full safety model, the
  public path, and the core-safety sentence each appear once. Home visible
  copy is 899 words. MP-17 records the six home role cards opening `/create`
  with that role selected at step 3. Both are on the live release above.
- Online enquiries stay on the mailto fallback to andy@chapelgatehome.uk
  until a working lead endpoint is configured. The lead form is not shown
  while that fallback is active.
- Canonical, Open Graph, and sitemap URLs use the staging host because no
  production domain has been chosen.
- The product-tour soundtrack is committed Higgsfield Seed Audio, voice Desmond.
  It is not the phone voice.

## Next step

The two remaining autonomous slices and the final regression are done.
NVIDIA /oc output on this repo requires Cursor acceptance. UI slices route to
Cursor after 3 demonstrated /oc failures. HB-004, HB-005, and HB-006 stay open.
No new human blocker came out of the regression.
