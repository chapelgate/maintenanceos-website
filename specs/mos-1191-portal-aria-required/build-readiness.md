# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: NOT_APPLICABLE
Reason: HTML attribute only; no new routes or traffic paths.

## 2. Performance
Status: NOT_APPLICABLE
Reason: no queries, caches, or meaningful payload growth.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no data model or persistence changes.

## 4. Messaging and async
Status: NOT_APPLICABLE
Reason: no workers, topics, or async paths.

## 5. Security
Status: APPLIES
Reason: static ARIA attributes only; no secrets; CSP unchanged; no inline scripts or styles.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1191-portal-aria-required; rollback by revert.

## 7. Operations
Status: APPLIES
Reason: clearer required-field announcement for portal operators using assistive tech.

## 8. Runtime hygiene
Status: APPLIES
Reason: reuses existing portal forms; voice and deploy paths untouched.
