# mw-32-a11y-skip-link-lock

## Problem

The accessibility page remediation plan (item 2) requires expanding automated route coverage in `tests/webkit-a11y/a11y.test.mjs`. Currently only 7 routes are tested: /, /create/, /demo/, /features/, /pricing/, /security/. Missing public routes: /faq/, /blog/, /trust/, /compare/, /subprocessors/, /vulnerability-disclosure/, /accessibility/, /cookies/, /terms/, /privacy/, /about/, /contact/, /ai-receptionist/, /buyers/, /how-it-works/, /how-we-keep-control/, /industries/, /integrations/, /status/.

Also the skip-link lock test (`scripts/skip-link-lock.test.mjs`) only checks layout.tsx — should also verify every page layout includes the skip link.

## Cause

A11y route list was a minimal subset; other pages were never added. Skip-link test only checked root layout.

## Acceptance

- `tests/webkit-a11y/a11y.test.mjs` includes all public routes listed above.
- `scripts/skip-link-lock.test.mjs` verifies skip link appears in every layout (root + nested layouts if any).
- npm test 630+ pass.
