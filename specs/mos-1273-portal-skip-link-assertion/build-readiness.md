# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: no HTTP ingress or rate-limit changes.

## 2. Performance
Status: NOT_APPLICABLE
Reason: no hot-path algorithm or latency change.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no persistence schema or migration changes.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no workers, topics, or async paths.

## 5. Security
Status: NOT_APPLICABLE
Reason: test-only assertion alignment; markup already shipped.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1273-portal-skip-link-assertion; rollback by revert.

## 7. Operations
Status: APPLIES
Reason: suite honesty restored; named portal skip tests prove acceptance.

## 8. Runtime hygiene
Status: APPLIES
Reason: tests/test_portal_skip_link.py only; frozen paths untouched.
