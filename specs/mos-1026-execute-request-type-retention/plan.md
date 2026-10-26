# Plan
1. After tenant check, require request.request_type == "RETENTION_SWEEP".
2. Raise lifecycle_request_wrong_type before claim_action or mutation.
3. Run the three named tests.
