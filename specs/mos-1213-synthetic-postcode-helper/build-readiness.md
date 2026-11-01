# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: no HTTP ingress or rate-limit changes.

## 2. Performance
Status: NOT_APPLICABLE
Reason: pure helper over existing normalise_postcode.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no persistence changes.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no workers, topics, or async paths.

## 5. Security
Status: APPLIES
Reason: shared helper for recognising synthetic ZZ postcodes without accepting live ranges by mistake.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1213-synthetic-postcode-helper; rollback by revert.

## 7. Operations
Status: APPLIES
Reason: synthetic demos can reuse one helper for ZZ test postcodes.

## 8. Runtime hygiene
Status: APPLIES
Reason: postcode_normalise.py only; voice and deploy paths untouched.
