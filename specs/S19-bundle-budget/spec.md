# S19 Performance Budget CI Gate Specification

## Overview
Add a GitHub Actions CI gate that enforces bundle size budgets using next-bundle-analyzer to prevent performance regressions.

## Requirements
- **JS Budget**: < 150 KB gzipped (initial first-party JavaScript)
- **CSS Budget**: < 50 KB (initial first-party CSS)
- **Gate Location**: `.github/workflows/perf.yml`
- **Trigger**: Pull requests affecting src/, public/, package.json, next.config.ts
- **Tool**: `@next/bundle-analyzer` integrated via existing `performance-budget.mjs` script

## Acceptance Criteria
1. CI workflow runs on relevant PRs
2. Build completes successfully
3. Performance budget check runs with S19 budgets (JS_GZIP_BUDGET=150, CSS_BUDGET=50)
4. CI fails if any route exceeds budgets
5. CI passes when budgets are met

## Current State
- Existing `performance-budget.mjs` enforces 190 KB JS gzip / 120 KB CSS
- Current build produces ~171-181 KB JS gzip / 48 KB CSS
- S19 budgets are stricter than current reality (aspirational gate)
- Gate will fail on current codebase until optimization work is done