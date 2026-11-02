1. Extend escalation_text._has_control_chars to reject DEL and C1.
2. Keep tab/newline/CR allowed.
3. Named acceptance tests for DEL/C1 reject and clean accept.
