# Spec: mw-296-onboarding-walkthrough

## Goal
Onboarding walkthrough page — pre-launch synthetic demo, noindex, no live claims, recovery links, and excluded from sitemap.

## Acceptance
- Onboarding walkthrough page renders at `/onboarding/` (or appropriate route)
- Page has `robots: { index: false, follow: false }`
- Excluded from `marketingPaths`
- No live customer metrics, chat promises, calendar claims, or price guarantees
- No WCAG 2.2 AA verified claim
- `npm test 630/630`, typecheck clean, build green
- `scripts/onboarding-honesty.test.mjs` passes
