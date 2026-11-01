# Spec: mw-319 WebsiteMeasurement deferral

## Problem
Root layout statically imports `WebsiteMeasurement`, a client-only beacon that contributes to the shared client graph on every page.

## Scope
- Add `DeferredWebsiteMeasurement` using `next/dynamic` (`ssr: false`)
- Switch root layout to the deferred wrapper
- Lock with `scripts/website-measurement-deferral.test.mjs`

## Out of scope
- Changing measurement event schema or endpoints
- publicLaunch, deploy, nginx, golden line
