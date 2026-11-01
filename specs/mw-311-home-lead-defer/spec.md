# Spec: mw-311 home lead form deferral

## Problem
Lighthouse CI fails on `/` with Performance 86 (< 90). The homepage statically imports the client `LeadCaptureForm`, pulling lead-adapter and form JS into the initial bundle even though the form sits below the fold.

## Scope
- Defer homepage `LeadCaptureForm` with `next/dynamic` (`ssr: false`) and an accessible loading placeholder.
- Keep `leadType="launch_list"` and existing conversion-funnel behaviour.
- Add `scripts/home-lead-defer.test.mjs`.

## Out of scope
Font preload (intentionally false for WebKit double-fetch). Deploy/nginx. publicLaunch flip.

## Acceptance
- home-lead-defer tests pass
- conversion-funnel still matches home LeadCaptureForm launch_list
- npm test / lint / typecheck / build green
- publicLaunch remains false; no frozen paths
