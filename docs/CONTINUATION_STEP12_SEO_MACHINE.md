# Continuation Step 12 — SEO and machine discovery verification

**Date:** 2026-09-27
**Owner:** SEO + Product Investigator + Website Manager
**Baseline:** Step 11 commit `dfb57d81b6845891715b91eaa9f41398bd74d95c`

## Drift found and repaired

Human-facing positioning had been refreshed, but the public machine-readable
summaries still contained older internal language:

- an “owner-blocked” website-scan description;
- a named competitor parity disclaimer;
- a provider-specific controlled production-call line.

Those are now replaced with current provider-neutral, claims-safe language.

## Current machine/search position

- public brand: **MaintenanceOS by Chapelgate**;
- publisher: **Chapelgate**;
- category: UK maintenance operations software;
- outcome: incoming repair reports become structured work while critical cases,
  rules and authorised people retain the boundary;
- public staging scan: **not enabled**, queued crawl is the honest fallback;
- voice: under testing, no public always-on line;
- controlled carrier proof: not claimed;
- commercial GA: not claimed.

The root site description and homepage funnel metadata are also aligned to the
Step-4 outcome-led positioning.

## Regression

`scripts/machine-discovery-currentness.test.mjs` prevents public machine surfaces
from reintroducing Gemini, competitor names, the old owner-blocked wording, or the
old publisher identity.

## Verification

- focused SEO/machine suite: **23/23 PASS**;
- live SEO monitor: **0 failures** across the core category/funnel pages and all
  eight industry routes;
- live pages remain indexable, uniquely titled/described, canonicalised and
  structured-data-backed.
