# Spec: mw-320 global-error a11y landmarks

## Problem
`global-error.tsx` renders outside the root layout, so it has no skip link and its `<main>` lacks `id="main"`. The health-monitor a11y checks expect `lang="en-GB"`, `#main`, and "Skip to main content" on content pages; the standalone global error screen should match that baseline.

## Scope
- Add `id="main"` on the global-error `<main>`
- Add a skip-to-main link targeting `#main`
- Extend `scripts/honest-error.test.mjs` to lock these

## Out of scope
- Route `error.tsx` (already inside layout `#main`)
- publicLaunch, deploy, nginx, golden line, scanner

## Acceptance
- honest-error tests pass
- npm test (scripts) / lint / typecheck green
- publicLaunch remains false
