# Spec: mw-323 FAQ filter status a11y

## Problem
FAQ search filter changes result set without a clear live status announcement, and empty-filter state offers no recovery control.

## Scope
- Announce live result count with role=status and aria-live=polite
- Wire search input via aria-describedby to the count
- Empty state: Clear FAQ filter button that resets the query
- Lock with scripts/faq-filter-status.test.mjs

## Out of scope
- WCAG 2.2 AA claim, publicLaunch, scanner, deploy, nginx, golden line
