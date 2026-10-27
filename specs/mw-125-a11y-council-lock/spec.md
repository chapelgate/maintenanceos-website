# mw-125-a11y-council-lock

## Goal
Restore clean-checkout npm test green after mw-119: council-decisions accessibility lock must match the page.

## Bug
mw-119 split "physical iPhone or Mac Safari" across lines and dropped "Playwright WebKit 26.6" / baseline "seven routes" wording required by scripts/council-decisions.test.mjs.

## Acceptance
- council-decisions accessibility lock passes
- a11y-coverage-honesty locks still pass
- full npm test green
- No WCAG AA claim; no PUBLIC_LAUNCH; no deploy
