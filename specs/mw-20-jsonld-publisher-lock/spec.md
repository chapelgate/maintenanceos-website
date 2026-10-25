# mw-20-jsonld-publisher-lock

## Problem

Structured data in `src/lib/json-ld.ts` carries the publisher name and product status, but nothing fails the build if those honest lines drift into a sale or certification claim.

## Cause

Brand-consistency tests cover some public copy; this file needs its own lock on this cut.

## Acceptance

- `scripts/jsonld-publisher-lock.test.mjs` locks Chapelgate Technologies, WorkSmartOS, MaintenanceOS, pre-launch language, null priceSpecification, and PreOrder availability.
- It refuses WCAG verification, price symbols, and buy-now claims in that file.
- `node --test scripts/jsonld-publisher-lock.test.mjs` exits 0.
