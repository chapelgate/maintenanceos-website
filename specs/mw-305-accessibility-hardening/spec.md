# Spec: Accessibility Hardening — Honesty Guard

## Objective
Add edge-case WCAG 2.2 AA honesty tests (focus-visible contrast, shared nav target sizes, wordmark visible-name, alt-text sweep) and fix focus-visible regex to prevent false positives.

## Acceptance Criteria
- focus-and-reduced-motion.test.mjs uses `/:focus-visible\s*\{/` regex (not fragile line-boundary)
- shared-navigation-targets.test.mjs verifies 24×24 CSS px hit areas on SiteHeader, CtaPair, BentoCard
- wordmark-visible.test.mjs asserts visible name only (no aria-label fallback)
- image-alt-sweep.test.mjs passes without changes
- All 4 test files pass; npm test 630/630; lint clean; typecheck clean; build green
