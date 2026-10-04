# Fix

Reuse the existing DigitalOcean canary branch changes exactly:

1. Add `playwright@1.63.0` and `pdfjs-dist@6.3.289` to the isolated onboarding-ingest package.
2. Add its existing lockfile.
3. Make the existing Dockerfile run `npm ci --omit=dev`.
4. Install the Playwright Chromium shell in the image and set `PLAYWRIGHT_BROWSERS_PATH`.
5. Change nothing in Scanner V2 application logic, routing, feature flags, production hosts or telephony.

Rollback: revert this PR. The current production runtime/routing is unchanged by this slice.
