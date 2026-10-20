# S40 Implementation Plan

## Steps

1. **Create security workflow** (`.github/workflows/security.yml`)
   - Trigger on `pull_request` and `push` to `main`
   - Use `ubuntu-latest` runner
   - Set `REQUIRE_SECURITY_HEADERS=1` and `WEBSITE_SITE_URL=https://worksmartos.co.uk`
   - Checkout, setup Node.js 20, `npm ci`, run `npm run security:live`

2. **Verify locally**
   - Run `npm run security:live` locally with `REQUIRE_SECURITY_HEADERS=1` to confirm current behavior
   - Ensure the script exits with appropriate code

3. **Create PR**
   - Branch: `feat/S40-security-live-scan`
   - PR body with Estate preflight headers
   - Wait for CI checks (estate-gate, validate, webkit-a11y, security-live)

4. **Merge when all checks pass**