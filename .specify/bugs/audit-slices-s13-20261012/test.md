# Test

`scripts/audit-slices.test.mjs` locks the five shared steps, the dashboard link, sitemap removal, noindex, the product-tour focus rule, the organisation name, the absence of ReceptionistOS in source, description length, title suffixes, the static-export trailing slash, and the lead-form fallback.

`npm test` (259 + 454), eslint, and `tsc --noEmit` passed.

Verdict: verified locally before merge.
