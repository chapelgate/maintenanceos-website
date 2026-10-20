# S39 Implementation Plan

## Approach
Since the two root cause vulnerabilities (braces and sprintf-js) have no patched versions available, we cannot fix them by upgrading dependencies. Instead, we:

1. Document the vulnerabilities as known unpatchable issues in dev dependencies
2. Create a custom CI audit script that filters them out
3. Ensure the script fails on any other actionable vulnerabilities

## Files Changed
- `package.json`: Added `audit:ci` script, updated `eslint-config-next` to 16.4.2
- `package-lock.json`: Updated lockfile
- `scripts/audit-ci.mjs`: New custom audit script
- `specs/S39-npm-audit-remediation/`: Documentation

## Verification Steps
1. `npm ci` - clean install
2. `npx tsc --noEmit` - TypeScript check
3. `npm run lint` - ESLint check
4. `npm test` - Run test suite (2 pre-existing failures expected)
5. `npm run build` - Production build
6. `npm run audit:ci` - Custom audit check (must pass)

## Risk Assessment
- Low risk: Vulnerabilities are in dev dependencies only (build tooling)
- Low risk: DoS requires attacker-controlled input to build tools
- No production impact: Dev dependencies don't ship to production