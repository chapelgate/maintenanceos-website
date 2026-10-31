# Assessment — mos-1084 correlation_id gap

## Symptom
GET /health returns no correlation_id in JSON and no x-correlation-id header; structured operational events only carried request_id, so health/log correlation stopped at the middleware header.

## Root cause
api.health built the allowlisted body without reading request_context.request_id(). operational_event injected request_id only; SAFE_EVENT_FIELDS omitted correlation_id.

## Class
BUG (incomplete request correlation on the public health surface)

## Acceptance
- /health body includes non-empty correlation_id matching x-request-id / x-correlation-id
- supplied x-request-id is echoed as correlation_id
- operational_event emits correlation_id beside request_id when structured logging is on
- x-csrf-token remains on /health
