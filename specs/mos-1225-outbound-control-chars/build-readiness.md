# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: no HTTP ingress or rate-limit changes.

## 2. Performance
Status: NOT_APPLICABLE
Reason: same O(n) control-char scan pattern used elsewhere.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no persistence schema changes.

## 4. Messaging and async
Status: APPLIES
Reason: outbound queue fails closed before CommunicationDelivery insert.

## 5. Security
Status: APPLIES
Reason: recipient/action_key/body fail closed on control characters.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1225-outbound-control-chars; rollback by revert.

## 7. Operations
Status: APPLIES
Reason: operators get clear ValueError on malformed outbound fields.

## 8. Runtime hygiene
Status: APPLIES
Reason: communications.py only; voice and deploy paths untouched.
