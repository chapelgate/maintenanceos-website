# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: input validation only; no new network paths.

## 2. Performance
Status: NOT_APPLICABLE
Reason: membership check on a seven-character frozenset per input char.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: rejects bad input before persistence; no schema change.

## 4. Messaging and async
Status: ALREADY_COVERED
Reason: shared helper already used by messaging/portal form paths.

## 5. Security
Status: APPLIES
Reason: blocks zero-width and format chars used to hide or spoof text.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1028-reject-zw-format/; ready PR; rollback by reverting slice.

## 7. Operations
Status: NOT_APPLICABLE
Reason: no new logging, metrics, alerts, or SLOs beyond existing 400 responses.

## 8. Runtime hygiene
Status: APPLIES
Reason: frozenset lock test and parametrized reject tests cover the new chars.
