# Test Plan: /trust/ claims alignment

## Test Coverage

### Existing Trust Tests (All Passing)
1. `scripts/trust-recovery-nav.test.mjs` - Recovery links and pre-launch framing
2. `scripts/trust-demo-preview-lock.test.mjs` - Voice demo preview not live 24/7
3. `scripts/trust-certification-honesty.test.mjs` - Certifications honest about PLANNED
4. `scripts/trust-strip-verified-honesty.test.mjs` - Home trust strip honesty
5. `scripts/trust-cert-lock.test.mjs` - Certification denial and pre-launch status

### New Claims-Consistency Test
- `scripts/trust-claims-consistency.test.mjs` - Maps /trust/ claims to PRODUCT_CLAIMS_REGISTER.md entries

### Test Results
All 5 existing trust test suites pass (2+2+4+2+2 = 12 subtests).
New claims-consistency test passes (3 subtests).

### Verification Commands
```bash
# Run trust tests
node scripts/trust-recovery-nav.test.mjs
node scripts/trust-demo-preview-lock.test.mjs
node scripts/trust-certification-honesty.test.mjs
node scripts/trust-strip-verified-honesty.test.mjs
node scripts/trust-cert-lock.test.mjs
node scripts/trust-claims-consistency.test.mjs

# TypeScript check
npx tsc --noEmit

# Lint
npx eslint
```

### Expected Outcomes
- All trust tests: PASS
- TypeScript: PASS (no errors)
- Lint: PASS (no errors)
- Pre-existing font-preload test failure (unrelated to this fix): FAIL (known issue)