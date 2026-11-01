# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: no HTTP ingress or rate-limit changes.

## 2. Performance
Status: NOT_APPLICABLE
Reason: O(n) over short strings only.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no persistence schema changes.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no workers, topics, or async paths.

## 5. Security
Status: APPLIES
Reason: identity postcode/phone helpers fail closed on overlong/control-char input.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1231-identity-postcode-cap; rollback by revert.

## 7. Operations
Status: APPLIES
Reason: identity matching stays on bounded printable values.

## 8. Runtime hygiene
Status: APPLIES
Reason: identity.py only; no voice/deploy path edits.
