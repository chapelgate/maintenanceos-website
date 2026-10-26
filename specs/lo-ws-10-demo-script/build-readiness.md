# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: fail-closed landlord vertical errors and diagnostics stay on existing API paths.

## 2. Performance
Status: NOT_APPLICABLE
Reason: no new queries, caches, or indexes; in-process metrics and tests only.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no schema or migration change; pilot vertical behaviour only.

## 4. Messaging and async
Status: ALREADY_COVERED
Reason: reuses existing pilot paths without new topics or workers.

## 5. Security
Status: APPLIES
Reason: typed error codes and diagnostics avoid leaking secrets; covered by dedicated pytest.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under this specs slug; draft PR; rollback by reverting the slice commit and deleting the specs folder.

## 7. Operations
Status: APPLIES
Reason: observability metrics and diagnostics improve failure visibility without new alert infra.

## 8. Runtime hygiene
Status: APPLIES
Reason: typed vertical errors replace opaque failures before further mutation.
