# mos-1028-lifecycle-decision-reason-control

## Goal
lifecycle_runtime._apply_decision rejects control characters in decision.reason before audit write.

## Acceptance
- _apply_decision raises LifecycleRuntimeError("lifecycle_decision_control_chars")
- tests pass
