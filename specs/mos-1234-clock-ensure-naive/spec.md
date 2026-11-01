# mos-1234-clock-ensure-naive
FEATURE: add ensure_naive_utc helper for datetime normalisation

## What
Callers mix aware/naive datetimes; clock only exposes utcnow(). Need a shared helper to coerce UTC-aware values to naive UTC and reject non-UTC aware inputs.

## Acceptance
- ensure_naive_utc(None) raises ValueError
- Naive datetimes pass through
- UTC-aware datetimes become naive UTC
- Non-UTC aware datetimes raise ValueError
