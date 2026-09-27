# Continuation Step 11 — performance verification

**Date:** 2026-09-27
**Owner:** Performance + Website Manager
**Baseline:** Step 10 commit `cc5e34d87fd256ed1abbdaf436754968a36ba462`

## Result

`npm run performance:budget` — **PASS**, 28 exported pages, 0 failures.

Locked budgets:

- initial first-party JS raw: **≤ 600 KB**;
- initial first-party JS gzip: **≤ 190 KB**;
- CSS: **≤ 120 KB**.

Largest measured routes:

| Route | Raw JS | Gzip JS | CSS |
| --- | ---: | ---: | ---: |
| /demo/ | 580 KB | 177 KB | 48 KB |
| /dashboard/ | 571 KB | 175 KB | 48 KB |
| /create/ | 567 KB | 174 KB | 48 KB |
| / | 564 KB | 173 KB | 48 KB |
| /contact/ | 562 KB | 173 KB | 48 KB |

No dependency or runtime change is required.

## Boundary

This is static-build/lab evidence. It is not a CrUX or field Core Web Vitals
claim and must not be marketed as one without real field data.
