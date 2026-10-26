# Plan
1. Add SAFETY_CLEARANCE_REASON_MAX = 1000 to safety_controls.py and enforce it in clear_critical_safety.
2. Bind /safety/clear reason to _bounded_text with maximum=SAFETY_CLEARANCE_REASON_MAX.
3. Run the three named tests.
