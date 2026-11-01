# mos-1204-critical-safety-events
FEATURE: emit operational_event when critical safety is latched or cleared

## What
latch_critical_safety and clear_critical_safety write AuditEvents but emit no operational_event for operators watching structured logs.

## Acceptance
- Emit operational_event("critical_safety_latched", ...) after a successful latch with client_id/outcome/reason_code only
- Emit operational_event("critical_safety_cleared", ...) after a successful clear with client_id/outcome/reason_code only
- Never log clearance reason text or flag payloads
- Existing safety suites stay green
