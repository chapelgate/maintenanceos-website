# Spec: mw-321 onboarding numbered walkthrough

## Problem
`/onboarding/` is a thin honesty note. Review scoring asks for onboarding UX that helps Andy inspect the synthetic demo without claiming launch.

## Scope
- Add a numbered, ordered walkthrough (homepage → demo → pricing honesty → contact mailto) with `aria-labelledby`
- Keep noindex, no price, no live phone/chat/WCAG-AA claims
- Lock with `scripts/onboarding-walkthrough.test.mjs`

## Out of scope
- Live onboarding ingest / scanner (frozen t835u)
- publicLaunch, deploy, nginx, golden line

## Acceptance
- onboarding-walkthrough + onboarding-honesty tests pass
- npm test (scripts) / lint / typecheck green
- publicLaunch remains false
