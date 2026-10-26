# Plan

1. Publish `EXPORT_WORK_ORDER_FIELDS` and `FORBIDDEN_EXPORT_FIELDS` in `export_csv.py`.
2. Refuse export when allowlist intersects forbidden keys.
3. Keep positive integer `client_id` gate.
4. Add focused pytest coverage for allowlist, rejection, and CSV headers.
