# Plan
1. Add one helper that strips the token, rejects short values and known placeholders, and returns the token or nothing.
2. Use that helper in `require_internal_api` and in the `internal_api_secured` readiness check.
3. Run the three named tests plus the existing internal API boundary test.
