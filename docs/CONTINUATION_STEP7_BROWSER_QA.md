# Continuation Step 7 — mobile and browser QA

**Date:** 2026-09-27
**Owner:** QA + Front-End
**Baseline:** Step 6 commit `529bafd20c8f835e66786ee1be6b0ec43a6bd553`

## Automated browser gate

A zero-dependency CDP smoke command now reuses the repository's existing
headless-browser pattern:

```bash
npm run browser:smoke
```

It starts the completed static export on loopback, launches installed Microsoft
Edge/Chromium, and checks six high-value routes at:

- 390 × 844 mobile;
- 768 × 1024 tablet;
- 1440 × 900 desktop.

For every route/viewport pair it verifies:

- no horizontal document overflow;
- one H1 is present;
- the `#main` landmark exists;
- focusable controls exist;
- the primary Create CTA exists on buyer pages.

The command is intentionally not a mandatory release-preflight dependency because
CI/browser availability is not guaranteed. It is a release-candidate QA command.

## Browser scope

This automated evidence proves the installed Chromium/Edge engine only. It does
not claim Safari/WebKit or Firefox certification. Safari/iOS and independent
assistive-technology/manual checks remain explicit human launch gates rather than
being faked from Windows.

## Verification

Installed Microsoft Edge/Chromium executed **18 route/viewport checks**:

- 6 buyer-critical routes;
- 3 viewport classes;
- mobile 390px and tablet 768px reported document width exactly equal to the
  viewport;
- desktop content width remained within the browser client width;
- every checked route retained its H1, main landmark, focusable controls and
  Create CTA where required;
- **0 failures**.
