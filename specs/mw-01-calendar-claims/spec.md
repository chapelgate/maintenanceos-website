# mw-01-calendar-claims

## Problem

Google Calendar and Outlook are labelled `available` and the integrations UI offers Connect, which falsely claims those integrations are live on the pre-launch static storefront.

## Cause

`src/lib/integrations.ts` still sets `status: "available"` for google and outlook; the integrations pages treat that as Available and render Connect without using `isProviderAvailable`.

## Acceptance

- google and outlook entries use `status: "coming-soon"`.
- Integrations page lede/JSON-LD do not claim live connect; no "credentials never touch the browser" sentence.
- Provider page does not render Connect or build an auth URL unless `isProviderAvailable` is true.
- `node --experimental-strip-types --test src/lib/integrations.test.ts` exits 0.
- `node --test scripts/integrations-claims.test.mjs` exits 0.
