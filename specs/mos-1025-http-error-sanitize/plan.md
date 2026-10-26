# Plan
1. Add http_error_text.sanitize_http_detail with the same secret patterns used elsewhere.
2. Register a FastAPI HTTPException handler that returns redacted JSON detail.
3. Add focused pytest coverage.
Rollback: delete http_error_text.py, handler, tests, and specs dir.
