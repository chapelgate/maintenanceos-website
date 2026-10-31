# Fix — mos-1190

In _sanitize_http_exception JSON branch, when request_context.request_id() is set, add correlation_id alongside sanitized detail. Keep /contractor/* HTML role=alert path unchanged.
