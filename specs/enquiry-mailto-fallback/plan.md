# Plan

Keep `EnquiryUnavailable` intact for `/create` and replace the dead-end in `LeadCaptureForm` with a client-validated `mailto:` and clipboard fallback.

1. Add `buildEnquiryMailto` and `validateEnquiryFields` in `src/lib/public-enquiry.ts` with `encodeURIComponent` encoding, UTF-16-safe body/URL length caps, and subject `WorkSmartOS enquiry from <name>` (or `WorkSmartOS enquiry` when name is blank).
2. Update `src/components/LeadCaptureForm.tsx` to keep all enquiry fields (`name`, `email`, `phone`, `organisation`, `role` / business type, `message`), validate them client-side with `aria-live="polite"` error messages and focus management, and open the generated `mailto:` URL on submit when no form endpoint is configured.
3. Provide a 48px (`min-h-12`) `Copy details` button and plain `info@chapelgatetechnologies.com` fallback address alongside clear copy that submitting opens the visitor's email app and nothing is sent until they press send.
4. Cover `buildEnquiryMailto` and `validateEnquiryFields` in `src/lib/public-enquiry.test.ts` and update form contract tests in `scripts/production-lead-endpoint.test.mjs` and `scripts/audit-slices.test.mjs`.
