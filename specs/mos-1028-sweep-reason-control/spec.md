# mos-1028-sweep-reason-control

## Goal
queue_retention_sweep rejects control characters in reason, actor, and subject_id.

## Acceptance
- queue_retention_sweep raises LifecycleRuntimeError("sweep_control_chars")
- tests pass
