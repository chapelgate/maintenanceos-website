# Fix — mos-1194

In api.metrics_endpoint, copy operational_metrics into a dict and set correlation_id from request_context.request_id() (None when absent).
