# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: fail-closed overlong postcode normalisation on the identity_postcode API path.

## 2. Performance
Status: NOT_APPLICABLE
Reason: single early length checks; no new queries, caches, or indexes added.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no schema, migration, or persistence change; validation helper only.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no messaging provider or worker behaviour changes in this slice.

## 5. Security
Status: APPLIES
Reason: overlong postcode values cannot match via the API verification helper.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1027-postcode-normalise-max/; ready PR; rollback by reverting slice commits.

## 7. Operations
Status: APPLIES
Reason: empty normalised postcodes keep postcode_matches fail-closed as false.

## 8. Runtime hygiene
Status: APPLIES
Reason: helper rejects overlong input before equality comparison proceeds.
