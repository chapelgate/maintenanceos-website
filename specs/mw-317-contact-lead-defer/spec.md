# Spec: mw-317 contact lead form deferral

## Problem
`/contact` statically imports `LeadCaptureForm`, pulling the full client form (validation, mailto fallback, rate-limit UI) into the initial JS for a page whose primary CTA is already mailto.

## Scope
- Add `DeferredLeadCaptureForm` using `next/dynamic` (`ssr: false`) with an accessible loading placeholder
- Switch `/contact` to the deferred wrapper
- Lock with `scripts/contact-lead-deferral.test.mjs`

## Out of scope
- Changing LeadCaptureForm behaviour
- publicLaunch, deploy, nginx, golden line

## Acceptance
- contact-lead-deferral tests pass
- npm test / lint / typecheck / build green
- publicLaunch remains false
