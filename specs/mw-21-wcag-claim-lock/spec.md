# mw-21-wcag-claim-lock

## Problem

Help centre MDX claimed the tenant portal "meets WCAG 2.2 AA" and framed Level AA conformance as current, while the live accessibility page correctly says conformance is not verified.

## Cause

Help articles were written as product aspiration copy and were never locked against the standing "no WCAG 2.2 AA claims" rule.

## Acceptance

- Help articles no longer say WCAG 2.2 AA is met or verified.
- `scripts/wcag-claim-lock.test.mjs` fails the build on met/verified/compliant claims and requires an honesty qualifier wherever `WCAG 2.2 AA` appears in `src` or `public`.
- `node --test scripts/wcag-claim-lock.test.mjs` exits 0.
