# Fix

- Home, the shared path strip, and `/demo` render `CREATE_JOURNEY_STEPS`: Website, Check, Choose, Configure, Review & Try. The extra save step and "→ optional save" are gone.
- `/dashboard` no longer prints environment or package paths. It links to `/demo/#sample-dashboard`.
- `/status` and `/dashboard` are out of `marketingPaths` and set `robots` to noindex.
- The product-tour video draws a 3px accent outline on `:focus-visible`, inset so the card's overflow does not clip it.
- The JSON-LD organisation name is Chapelgate Technologies. ReceptionistOS is removed from TypeScript, JavaScript, text, and CSS sources.
- Descriptions that were over 160 characters are shorter. Absolute titles end with "| MaintenanceOS", and other titles use the `%s | MaintenanceOS` template. No 301 was added.
- The lead form shows the email error on the field, focuses that field, and treats a filled hidden website field as a completed submission without posting. The enquiry fallback still replaces the form when no endpoint is configured.
