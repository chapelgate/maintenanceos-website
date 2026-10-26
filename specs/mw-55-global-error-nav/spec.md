# mw-55-global-error-nav

## Problem
`src/app/global-error.tsx` has Try again but no recovery links to home or contact, unlike `src/app/error.tsx`.

## Acceptance
- global-error keeps the honest pre-launch failure copy.
- global-error links to `/` and `/contact/`.
- `node --test scripts/honest-error.test.mjs` exits 0.
