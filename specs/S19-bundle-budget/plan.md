# S19 Performance Budget CI Gate Plan

## Implementation Steps

1. **Add @next/bundle-analyzer to devDependencies** (package.json)
   - Version aligned with Next.js 16.3.8

2. **Update performance-budget.mjs to accept environment variable overrides**
   - JS_RAW_BUDGET (default 600 KB)
   - JS_GZIP_BUDGET (default 190 KB, override to 150 KB for S19)
   - CSS_BUDGET (default 120 KB, override to 50 KB for S19)

3. **Create .github/workflows/perf.yml**
   - Trigger on PRs to main with relevant path filters
   - Run npm ci, npm run build
   - Run performance:budget with S19 env vars
   - Fail CI if budgets exceeded

4. **Verify locally**
   - npm ci
   - npx tsc --noEmit
   - npm run lint
   - npm run build
   - npm test
   - npm run performance:budget with S19 budgets

## Dependencies
- S0 (validate CI job fix) - already complete
- Existing performance-budget.mjs script
- Next.js 16 static export configuration

## Risk Assessment
- **Low risk**: Adds CI gate only, no runtime behavior changes
- **Known issue**: Current codebase exceeds S19 budgets (~171-181 KB vs 150 KB target)
- **Mitigation**: Gate prevents future regressions; optimization tracked separately

## Rollback Plan
- Revert PR to remove perf.yml and package.json changes
- No database or infrastructure changes