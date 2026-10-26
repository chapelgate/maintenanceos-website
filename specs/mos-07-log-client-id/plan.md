# Plan

1. Add `client_id` to the safe operational fields.
2. Emit it only when the value is a real integer.
3. Keep the existing redaction tests green.
4. Add this Spec Kit artifact so Estate Gate can see the FEATURE route is converged.

Rollback: remove `client_id` from `operational_logging.py`, remove the two new tests, and delete `specs/mos-07-log-client-id/`.
