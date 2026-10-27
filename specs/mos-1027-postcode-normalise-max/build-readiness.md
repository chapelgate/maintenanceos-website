# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: fail-closed overlong postcode normalisation before identity_postcode DB session.

## 2. Performance
Status: NOT_APPLICABLE
Reason: single early length checks; no new queries, caches, or indexes.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no schema, migration, or persistence change; validation helper only.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no messaging provider or worker behaviour changes in this slice.

## 5. Security
Status: APPLIES
Reason: overlong postcode values rejected before session and property query.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1027-postcode-normalise-max/; ready PR; rollback by reverting slice commits.

## 7. Operations
Status: APPLIES
Reason: empty normalised postcode keeps identity_postcode fail-closed with False.

## 8. Runtime hygiene
Status: APPLIES
Reason: invalid postcodes never open a database session via identity_postcode.
