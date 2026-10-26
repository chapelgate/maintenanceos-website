# Plan
1. Add HOLD_REASON_MAX = 1000 to lifecycle_runtime.py.
2. Reject overlong reason in create_hold with LifecycleRuntimeError.
3. Run the three named tests.
