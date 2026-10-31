# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: same exception path; response content-type only for portal routes.

## 2. Performance
Status: NOT_APPLICABLE
Reason: tiny static HTML string; no queries or caches.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no persistence or schema changes.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no workers or messaging paths.

## 5. Security
Status: APPLIES
Reason: reuses sanitize_http_detail and html.escape; CSP unchanged; no inline scripts/styles.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1192-portal-html-errors; rollback by revert.

## 7. Operations
Status: APPLIES
Reason: contractors using assistive tech hear portal failures instead of raw JSON.

## 8. Runtime hygiene
Status: APPLIES
Reason: reuses _portal_page; voice/deploy untouched; API JSON clients unchanged.
