# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: dashboard auth rejects overlong email and password before DB lookup and PBKDF2.

## 2. Performance
Status: APPLIES
Reason: overlong passwords never reach PBKDF2, limiting CPU amplification on the sign-in path.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no schema change; invalid credentials never reach User lookup when overlong.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: dashboard auth path only; no messaging endpoint change.

## 5. Security
Status: APPLIES
Reason: overlong login inputs fail closed before query and password verification.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1027-dashboard-login-max/; ready PR; rollback by reverting slice commits.

## 7. Operations
Status: APPLIES
Reason: Streamlit errors distinguish overlong email/password from invalid login.

## 8. Runtime hygiene
Status: APPLIES
Reason: invalid overlong credentials never reach persistence or hashing on the covered paths.
