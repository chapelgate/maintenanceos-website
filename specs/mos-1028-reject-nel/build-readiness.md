# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: input validation only; no new network paths or retries.

## 2. Performance
Status: NOT_APPLICABLE
Reason: one extra frozenset membership check per character.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: request validation only; no persistence or schema change.

## 4. Messaging and async
Status: ALREADY_COVERED
Reason: reuses existing _reject_control_chars callers without new topics.

## 5. Security
Status: APPLIES
Reason: blocks C1 control smuggling including NEL in shared text inputs.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1028-reject-nel/; ready PR; rollback by reverting slice.

## 7. Operations
Status: APPLIES
Reason: strengthens existing API input gate; no new metrics required.

## 8. Runtime hygiene
Status: APPLIES
Reason: dedicated pytest locks C1/NEL rejection in _reject_control_chars.
