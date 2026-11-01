# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: no HTTP ingress or rate-limit changes.

## 2. Performance
Status: NOT_APPLICABLE
Reason: one extra primary-key lookup per portfolio open.

## 3. Data and consistency
Status: APPLIES
Reason: TenantBoundary create is idempotent for synthetic landlord clients.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no workers, topics, or async paths.

## 5. Security
Status: APPLIES
Reason: non-synthetic preexisting boundary fails closed before portfolio write.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1256-landlord-boundary-idempotent; rollback by revert.

## 7. Operations
Status: APPLIES
Reason: synthetic landlord demo no longer dies on UNIQUE tenant_boundaries.

## 8. Runtime hygiene
Status: APPLIES
Reason: pilot/landlord_vertical.py only; voice/deploy paths untouched.
