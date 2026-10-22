# S8 Scanner Benchmark CI

## Summary
Add a GitHub Actions workflow that runs the scanner benchmark against a defined test set (30 sites from CRR_REVIEW_R1.md) with thresholds: correct ≥60%, wrong ≤3%, dangerous =0. The workflow should fail if thresholds are not met.

## Acceptance Criteria
1. `.github/workflows/scanner-benchmark.yml` runs on PRs and workflow_dispatch
2. Runs `npm run benchmark:scanner -- --ci` with appropriate thresholds
3. Fails if any field has correct <60%, wrong >3%, or dangerous >0
4. Spec artifacts in `specs/S8-scanner-benchmark/`
5. All existing tests pass

## Changes
- Add `.github/workflows/scanner-benchmark.yml`
- Implement `scripts/benchmark-scanner.ts` with threshold validation
- Add `npm run benchmark:scanner` script to package.json
- Create spec artifacts in `specs/S8-scanner-benchmark/`