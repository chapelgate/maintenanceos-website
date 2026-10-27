# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: header applied on every HTTP response through HttpSecurityBoundary.

## 2. Performance
Status: NOT_APPLICABLE
Reason: one static header tuple entry; no new queries or caches.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: response header only; no persistence or schema change.

## 4. Messaging and async
Status: ALREADY_COVERED
Reason: reuses existing ingress middleware without new topics.

## 5. Security
Status: APPLIES
Reason: denies Flash/Acrobat cross-domain policy files, reducing legacy plugin abuse.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1028-x-permitted-cross-domain/; ready PR; rollback by reverting slice.

## 7. Operations
Status: NOT_APPLICABLE
Reason: no new logging, metrics, alerts, tracing, or SLOs beyond existing headers.

## 8. Runtime hygiene
Status: APPLIES
Reason: locked by exact tuple equality tests and health response assertions.
