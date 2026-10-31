# Fix — mos-1195

In api.readiness_endpoint, copy readiness_report into a dict and set correlation_id from request_context.request_id() (None when absent).
