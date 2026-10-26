# Plan

1. Add a small `_portal_page(title, body)` HTML wrapper in `api.py`.
2. Rewrite contractor decision/availability/complete GET markup to use lang=en-GB, main, h1, and for/id labels.
3. Add `tests/test_contractor_portal_a11y.py`.
4. Keep POST success pages on the same wrapper.

Rollback: revert `api.py` HTML changes; delete the new tests and specs dir.
