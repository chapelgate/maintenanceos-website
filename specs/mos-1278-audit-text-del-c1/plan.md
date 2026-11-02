1. Extend audit_text._has_control_chars to treat DEL and C1 as controls.
2. Keep tab/newline/CR allowed; keep redact_secrets on clean detail.
3. Named acceptance tests for DEL and C1 rejection.
