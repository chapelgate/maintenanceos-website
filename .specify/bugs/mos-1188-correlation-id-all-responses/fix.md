# Fix — mos-1188

In ingress_security.py secured_send:
1. Treat x-correlation-id as a managed header (strip duplicates like x-request-id)
2. Append x-correlation-id with the same request_id value as x-request-id
