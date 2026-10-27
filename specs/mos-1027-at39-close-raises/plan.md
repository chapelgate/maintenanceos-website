# Plan
1. Remove try/except swallow around require_noncritical in close_work_order.
2. Soft-catch SafetyStateError in dashboard Close button.
3. Add focused regression test that close raises under critical latch.
4. Run AT39 + close_lifecycle_roles + new test.
