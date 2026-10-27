# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: Fail-closed 400 on DEL and bidi controls across all fields using _reject_control_chars.

## 2. Performance
Status: NOT_APPLICABLE
Reason: one extra membership check per character; no new queries or caches.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: request validation only; no persistence or schema change.

## 4. Messaging and async
Status: ALREADY_COVERED
Reason: messaging fields already call _reject_control_chars; inherit the stronger check.

## 5. Security
Status: APPLIES
Reason: blocks DEL and Unicode bidi overrides used for spoofing and log/UI confusion.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1028-reject-del-bidi/; ready PR; rollback by reverting slice commits.

## 7. Operations
Status: NOT_APPLICABLE
Reason: no new logging, metrics, alerts, tracing, or SLOs.

## 8. Runtime hygiene
Status: APPLIES
Reason: DEL/bidi rejection locked by dedicated unit tests; tab/lf/cr remain allowed.
