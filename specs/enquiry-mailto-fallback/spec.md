# Working enquiry fallback via mailto (no backend)

## Problem

The enquiry forms on `/demo/`, `/contact/`, and the `#join` section on the home page previously rendered `EnquiryUnavailable` ("Online enquiries are temporarily unavailable. Please email us from the link below.") whenever `siteConfig.formEndpoint` was empty because the retired Railway control plane returns HTTP 404. Visitors could not fill in structured enquiry fields before opening their email client or copying their details.

## Cause

`LeadCaptureForm` short-circuited to `<EnquiryUnavailable />` whenever `!siteConfig.formEndpoint.trim()` was true.

## Acceptance

- `/demo/`, `/contact/`, and `/#join` render the interactive `LeadCaptureForm` fields (`name`, `email`, `phone`, `organisation`, `role` / business type, `message`) without adding any server, function, secret, analytics, or third-party service.
- Client-side validation checks required `email` and optional `phone` format, surfaces errors with `role="alert"` and `aria-live="polite"`, sets `aria-invalid` and `aria-describedby`, and moves focus to the invalid field.
- Submitting without a configured backend opens the visitor's mail client with a `mailto:` link to `info@chapelgatetechnologies.com`, prefilled subject (`WorkSmartOS enquiry from <name>` or `WorkSmartOS enquiry`), and a URL-encoded, length-capped body built from the form fields.
- A visible 48px (`min-h-12`) `Copy details` button and the plain `info@chapelgatetechnologies.com` fallback email address are shown in case the visitor's mail client does not open.
- UI copy clearly states that submitting opens the visitor's email app and nothing is sent until they press send.
- `/create`, the website scanner, legal copy, and pricing copy remain untouched. Brand remains `WorkSmartOS` (one word).
