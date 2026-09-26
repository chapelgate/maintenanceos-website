# Continuation Step 1 — baseline freeze

**Status:** RELEASE CANDIDATE — close only after exact live SHA verification
**Date:** 2026-09-26
**Scope:** MaintenanceOS public/pre-launch marketing website only
**Canonical source:** `chapelgate/maintenanceos-website` `main`
**Live origin:** `https://seahorse-app-4oasq.ondigitalocean.app`

## Starting evidence

Before any change, repository `main` and live `/release.json` both resolved to
`be5fc313a5eeec52b968481f0181ae1261b467d6`. The existing Website Manager
reported healthy: 29 internal paths and 47 pages/assets checked with no failures,
SEO monitor clean, 185/185 tests passing, static build passing, performance
budget passing, and accessibility 12/12 passing.

That SHA is the rollback anchor for this continuation step. Website rollback
remains revert-only and isolated from the MaintenanceOS voice/product runtime.

## Defects found during baseline proof

1. The Next 15.5.25 lockfile produced two npm audit findings, including a
   high-severity PostCSS advisory reachable through the direct `next` dependency.
2. Next 15 was behind the current stable framework line.
3. Next 16 no longer runs lint from `next build`; without an explicit release
   gate, a framework upgrade would silently reduce release coverage.
4. Current Next/React lint rules exposed four synchronous state updates inside
   effects across calendar, dashboard, and demo-tab components.
5. The old Node package mode caused module-reparse warnings for TypeScript tests.
6. The old performance gate measured raw JavaScript only and could not distinguish
   framework source-size growth from network transfer size.

## Surgical repairs

- Upgraded Next to 16.3.6 and React/ReactDOM to 19.3.0.
- Migrated ESLint config to native flat config and removed `@eslint/eslintrc`.
- Kept ESLint at 9.39.5 because the latest React/import/a11y plugins bundled by
  the current Next config still declare/support ESLint 9, not ESLint 10.
- Kept TypeScript 5.9.3 because current `@typescript-eslint` supports TypeScript
  below 6.1; forcing TypeScript 7 would create an unsupported toolchain.
- Aligned Node typings to the Node 24 validation runtime and declared
  `node >=20.9.0`, matching Next 16's minimum runtime requirement.
- Set package type to ESM, eliminating TypeScript test module-reparse warnings.

- Removed the legacy webpack module-replacement path; optional create companions
  now use the existing Turbopack alias only, matching Next 16's default bundler.
- Added lint as an explicit release-preflight gate and a regression assertion
  that prevents it being silently removed later.
- Reworked the four React effect-state findings rather than suppressing the
  modern lint rule.
- Replaced the raw-only JavaScript budget with dual 600 KB raw / 190 KB gzip
  limits. The Next 16 maximum measured 580 KB raw / 177 KB gzip on `/demo/`.
- Left the pending `unrs-resolver` postinstall unapproved. It is a transitive
  ESLint resolver dependency; lint/build/tests work without granting it extra
  install-script authority.

## Before/after performance evidence

Fresh clean builds were compared, not remembered figures:

| Build | /demo raw JS | /demo gzip JS |
| --- | ---: | ---: |
| Next 15.5.25 at `be5fc313…` | 485 KB | 150 KB |
| Next 16.3.6 candidate | 580 KB | 177 KB |

The Next 16 runtime is larger, but remains below the new dual ceilings. The raw
ceiling has less percentage headroom than the old 525 KB ceiling had against
the old 485 KB maximum, while gzip is now independently guarded.

## Compatibility holds

These are deliberate, non-blocking holds rather than unresolved defects:

- **ESLint 10:** current Next 16.3.6 transitive React/import/a11y lint plugins do
  not yet support it. Revisit when those upstream peers support ESLint 10.
- **TypeScript 7:** current `@typescript-eslint` declares TypeScript <6.1.
  Stay on latest supported 5.x until the lint toolchain supports the new major.
- **@types/node 26:** validation/deployment baseline is Node 24; typings remain
  aligned to that runtime instead of jumping ahead of it.

## Release-candidate gates

The candidate must pass all of the following from a clean committed branch:

- `npm run lint` — zero errors.
- `npm test` — full repository suite.
- `npm run build` — Next 16 static export.
- `npm run performance:budget` — raw + gzip + CSS + third-party-script gates.
- `npm run accessibility:check`.
- `npm audit` — zero known vulnerabilities at freeze.
- Default and flagged companion builds.
- Website Manager live monitor before release.
- Exact deployed `/release.json` SHA verification after merge.

## Freeze rule

Step 1 is complete only when the merged release SHA is served by the existing
DigitalOcean static app and the post-deploy Website Manager verification is
green. The exact freeze SHA and verification result are recorded on the release
PR. No second website, hosting app, telephony path, credential, or paid service
is introduced by this step.
