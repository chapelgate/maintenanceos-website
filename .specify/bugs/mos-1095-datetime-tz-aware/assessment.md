# Assessment — mos-1095 datetime.utcnow deprecation

## Symptom
Six test modules call deprecated `datetime.utcnow()`, emitting Python 3.12 DeprecationWarning.

## Root cause
Naive UTC construction; prefer timezone-aware `datetime.now(timezone.utc)`.

## Class
BUG (test hygiene / future breakage)

## Acceptance
- No `datetime.utcnow()` in the six listed test files
- Same behavioural assertions pass with aware datetimes
