# Assess

## Symptom

On `origin/main` at `352bd9ec`, `npm test` fails the Inter preload and trust-claims consistency locks, while `npm run lint` reports three unescaped apostrophe errors in `/trust/`.

## Cause

The trust claims merge enabled Inter preloading despite the WebKit double-fetch lock and used raw apostrophes in JSX. The corresponding source-text assertion did not account for the JSX entity encoding required by lint.

## Scope

Restore `preload: false`, encode the three JSX apostrophes, and align the exact source-text assertion. No claims, runtime endpoints, launch flags, frozen paths, or deployment configuration change.

## Acceptance

- `npm test` has zero failures.
- `npm run lint` has zero errors.
- `npm run typecheck` and `npm run build` exit successfully.
- `NEXT_PUBLIC_PUBLIC_LAUNCH` remains false.
