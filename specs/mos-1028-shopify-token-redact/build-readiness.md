# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: redaction only; no new network paths or retries.

## 2. Performance
Status: NOT_APPLICABLE
Reason: one additional regex substitution on existing redact paths.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no schema or persistence change.

## 4. Messaging and async
Status: ALREADY_COVERED
Reason: reuses existing redact_detail/_redact/sanitize_http_detail paths.

## 5. Security
Status: APPLIES
Reason: prevents Shopify API tokens leaking into HTTP errors, audit text, and ops logs.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1028-shopify-token-redact/; ready PR; rollback by reverting slice.

## 7. Operations
Status: APPLIES
Reason: redaction applies to operational_logging events automatically.

## 8. Runtime hygiene
Status: APPLIES
Reason: dedicated pytest locks Shopify token redaction across all three modules.
