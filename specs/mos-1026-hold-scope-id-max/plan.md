# Plan
1. Add SCOPE_ID_MAX = 200 to lifecycle_runtime.py.
2. Reject overlong scope_id in create_hold with LifecycleRuntimeError.
3. Run the three named tests.
