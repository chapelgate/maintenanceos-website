# mos-1060-rate-limiting

## Problem
RELEASE_PLAN requires explicit acceptance locks for max request bytes, security boundary middleware, content-length behaviour, oversized work-order rejection, concurrent public-path limits, and CSRF presence with large payloads.

## Acceptance
Named tests in tests/test_mos_1060_rate_limiting.py.

## Scope
Tests + smallest fixes if locks fail. No voice/deploy.
