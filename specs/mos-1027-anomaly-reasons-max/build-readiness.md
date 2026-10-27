# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: invoice_qa refuses when anomaly_reasons JSON exceeds ANOMALY_REASONS_MAX.

## 2. Performance
Status: NOT_APPLICABLE
Reason: single bound or raise path; no new queries or hot loops.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no schema or migration; rejects invalid input instead of storing it.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no outbound messaging or queue contract changes in this slice.

## 5. Security
Status: APPLIES
Reason: unbounded invoice anomaly_reasons Text writes are rejected before Invoice add.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1027-anomaly-reasons-max/; ready PR; rollback by reverting slice commits.

## 7. Operations
Status: APPLIES
Reason: encode_anomaly_reasons ValueError returns None from invoice_qa fail-closed.

## 8. Runtime hygiene
Status: APPLIES
Reason: invalid input never reaches persistence on the covered path.
