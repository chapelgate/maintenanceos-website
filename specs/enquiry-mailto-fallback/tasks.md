# Tasks

- [x] Add `buildEnquiryMailto` and `validateEnquiryFields` in `src/lib/public-enquiry.ts` with URL encoding and length caps
- [x] Add unit tests in `src/lib/public-enquiry.test.ts` for encoding, length cap, special characters, and field validation
- [x] Replace `EnquiryUnavailable` branch in `src/components/LeadCaptureForm.tsx` with client-validated `mailto:` submission, 48px `Copy details` button, and plain email fallback
- [x] Update `scripts/production-lead-endpoint.test.mjs` and `scripts/audit-slices.test.mjs` to verify the mailto fallback
- [x] Verify TypeScript typecheck, unit/contract tests, and static production build
