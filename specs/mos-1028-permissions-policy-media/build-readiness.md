# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: response header change only; no new network paths or retries.

## 2. Performance
Status: NOT_APPLICABLE
Reason: static header string length increase only.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: HTTP response headers only; no persistence or schema change.

## 4. Messaging and async
Status: ALREADY_COVERED
Reason: reuses existing SecurityHeadersMiddleware path without new topics.

## 5. Security
Status: APPLIES
Reason: denies additional powerful browser media/window features via Permissions-Policy.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1028-permissions-policy-media/; ready PR; rollback by reverting slice.

## 7. Operations
Status: APPLIES
Reason: strengthens existing SECURITY_HEADERS; no new metrics required.

## 8. Runtime hygiene
Status: APPLIES
Reason: dedicated pytest locks media/window Permissions-Policy denies.
