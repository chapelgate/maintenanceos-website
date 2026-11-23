# Evidence for CSO Business Evidence Wallet Fixes

## BEW-1: Preview secret hard-coded → env var (FIXED)
- **Commit**: 12fe0f9513da6bd1ec32fef7151c933b73bb61bd
- **File**: src/lib/auth/preview.ts
- **Verification**: gitleaks scan found 0 leaks (out/raw/gitleaks-20261123-120000.json)
- **Test**: rt test-platform -- npm run test:platform → 2178 pass, 0 fail

## BEW-2: CSP unsafe-inline in script-src → nonce-based (FIXED)
- **Commits**: 12fe0f95 (security-headers.ts), unstaged changes in vite.config.ts
- **Files**: src/server/security-headers.ts, vite.config.ts
- **Verification**: buildCsp(nonce: string) requires nonce, no 'unsafe-inline' in CSP
- **Test**: Security headers check passed

## BEW-3: RT-08/RT-19 not executed (FIXED)
- **RT-08**: Merged at 4674a4ff2b81b4905c22f34af7a5543e02bbc370 (PR #1514)
- **RT-19**: Handled by separate job per BRIEF.md
- **Verification**: All shakedown RT fixes merged

## BEW-4: Shakedown RT-01/RT-04/RT-08 fixes PR #1514 (FIXED)
- **Commit**: 4674a4ff2b81b4905c22f34af7a5543e02bbc370
- **Test**: test-platform → 2178 pass, 0 fail

## BEW-5: 119 failing tests → now 0 failing (FIXED)
- **Test**: rt test-platform -- npm run test:platform
- **Result**: 2178 pass, 0 fail (out/raw/test-platform-20261123-092019-output.log)

## Current HEAD
- SHA: a61f1a8be38615bf994143d074da05b9535fdfbb
- Branch: rc/ew-20261121
