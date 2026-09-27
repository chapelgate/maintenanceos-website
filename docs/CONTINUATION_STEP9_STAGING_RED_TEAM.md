# Continuation Step 9 — bounded staging red team

**Date:** 2026-09-27
**Owner:** Red Team + Defender + Website Manager
**Target:** `https://seahorse-app-4oasq.ondigitalocean.app`
**Scope:** public static marketing surface only
**Request budget:** 18

## Checks

The reusable command `npm run redteam:staging` performs a deliberately bounded,
read-only staging assessment:

- sensitive-file exposure probes for environment, Git, package, source and App
  Platform configuration paths;
- non-GET method checks without destructive payloads;
- query-string reflection check with a unique inert marker;
- external open-redirect check;
- 404 error leakage / stack-trace check;
- third-party absolute script-source check;
- CORS observation from an unrelated origin.

## Result

**PASS — 0 failures.**

Observed:

- all 8 sensitive paths returned **404**;
- POST / PUT / PATCH returned **400**;
- DELETE returned **404**;
- TRACE was rejected by the client/runtime and never sent successfully;
- inert query marker was **not reflected**;
- no external redirect was produced;
- unknown route returned **404** without a stack trace;
- unrelated-origin CORS response did not echo an allow-origin header;
- no third-party absolute script source was found in the homepage HTML.

## Boundary

This is an automated public-surface red-team regression, not an independent
penetration test, infrastructure assessment, authenticated product test, or
telephony test. It intentionally avoids load, credential attacks, persistence,
production lead creation, or any destructive action.
