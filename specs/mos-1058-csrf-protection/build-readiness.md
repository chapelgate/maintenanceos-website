# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: CSRF validation rejects forged contractor POSTs; health issues x-csrf-token without cookies.

## 2. Performance
Status: NOT_APPLICABLE
Reason: HMAC CSRF helpers are O(1) per form; no new queries or caches.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no schema or migration change; signed tokens only.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no new topics, workers, or async patterns introduced.

## 5. Security
Status: APPLIES
Reason: fail-closed CSRF on decision/availability/complete; APP_SECRET HMAC; no Set-Cookie.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1058-csrf-protection; rollback by revert.

## 7. Operations
Status: APPLIES
Reason: invalid CSRF returns 403 without leaking secrets or stack traces.

## 8. Runtime hygiene
Status: APPLIES
Reason: reuses security.py HMAC patterns; voice and deploy paths untouched.
