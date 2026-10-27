# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: rent_ledger_evaluation returns False unless flag and landlord vertical are both on.

## 2. Performance
Status: NOT_APPLICABLE
Reason: pure evaluation helper; no new queries or hot loops.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no schema or migration; read-only evaluation of caller-supplied synthetic facts.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no outbound messaging or queue contract changes in this slice.

## 5. Security
Status: APPLIES
Reason: fail closed without landlordos; never imports payment/bank modules; default off.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1026-07-rent-ledger-read/; ready PR; rollback by reverting slice commits.

## 7. Operations
Status: APPLIES
Reason: missing dependency or disabled flag returns False without raising into callers.

## 8. Runtime hygiene
Status: APPLIES
Reason: optional landlordos import only when enabled and library-shaped records are present.
