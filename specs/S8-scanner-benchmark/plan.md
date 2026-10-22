# S8 Scanner Benchmark CI - Plan

## Implementation Steps

1. **Add `.github/workflows/scanner-benchmark.yml`** - GitHub Actions workflow running scanner benchmark CI on PRs
2. **Implement `scripts/benchmark-scanner.ts`** - Benchmark script with accuracy thresholds (correct≥60%, wrong≤3%, dangerous=0)
3. **Add `npm run benchmark:scanner` script** to package.json
4. **Create spec artifacts** in `specs/S8-scanner-benchmark/`
5. **Local verification**: npm ci, npx tsc --noEmit, npm run lint, npm test, npm run build all pass
6. **Push** and open PR to main

## Files to Modify
- `.github/workflows/scanner-benchmark.yml` (new)
- `scripts/benchmark-scanner.ts` (new)
- `package.json` (modify - add script)
- `specs/S8-scanner-benchmark/spec.md` (new)
- `specs/S8-scanner-benchmark/plan.md` (new)
- `specs/S8-scanner-benchmark/tasks.md` (new)