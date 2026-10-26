# Plan
1. Require job.status == RUNNING at the start of execute_lifecycle_sweep.
2. Raise lifecycle_job_not_running otherwise.
3. Run the three named tests.
