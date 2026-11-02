# mos-1301-request-context-del-c1

## Goal
request_context.set_request_id must reject DEL (U+007F) and C1 controls (U+0080–U+009F) in addition to existing C0 reject.

## Acceptance
- set_request_id clears the request id on DEL/C1
- Existing C0 reject suite remains green
