# QA

Unit tests in `src/lib/public-enquiry.test.ts` verify `buildEnquiryMailto` subject formatting (`WorkSmartOS enquiry from <name>` and fallback `WorkSmartOS enquiry`), URL encoding of special characters (`&`, `=`, `?`, `#`, `%`, `+`, quotes, newlines, `£`), body and URL length caps, and `validateEnquiryFields` email/phone validation.

Contract and accessibility tests in `scripts/production-lead-endpoint.test.mjs`, `scripts/audit-slices.test.mjs`, `scripts/conversion-funnel.test.mjs`, and `scripts/site-accessibility.test.mjs` verify that `/demo/`, `/contact/`, and `/#join` keep the form fields, 48px (`min-h-12`) buttons, `aria-live` error states, `Copy details` fallback, and truthful UI copy while leaving `/create` and the scanner untouched.
