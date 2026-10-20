# CI Validate Workflow Scanner Stub Fix - Plan

## Steps
1. Update `src/config/site.ts` to read `onboardingScanEndpoint` from `NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT` env var
2. Update `.github/workflows/website-integration-repair-validation.yml` to not set the env var at build time
3. Update affected tests to match new pattern
4. Verify local build and tests pass
5. Push and verify CI passes