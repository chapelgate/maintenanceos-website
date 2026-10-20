# S20 Implementation Plan

## Overview
The pricing page was already rendering correctly with full HTML including the `<h1>` heading. This slice verifies the fix and adds regression protection.

## Changes
1. Extended `scripts/pricing-copy.test.mjs` with a new test verifying the static build output contains `<h1>Pricing</h1>`
2. Created spec artifacts in `specs/S20-pricing-ssr-fix/`

## Testing
- Run `npm run build` — passes
- Run `npm test` — new test "pricing page static output contains h1 heading" passes
- Run `npm run lint` — passes (pre-existing warnings only)
- Run `npx tsc --noEmit` — passes

## Acceptance Verification
- Local: `Select-String -Pattern "<h1" out\pricing\index.html` → matches
- Live: `curl https://worksmartos.co.uk/pricing/ | grep -c '<h1'` ≥ 1