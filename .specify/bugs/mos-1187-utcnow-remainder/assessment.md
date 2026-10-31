# Assessment — mos-1187 utcnow remainder

## Symptom
After mos-1095, naive datetime.utcnow() remained in tests/test_mos_1186_tenant_health_process_local.py, local_acceptance_harness.py, verify_dashboard_synthetic.py, and run_mutation_detection.py.

## Root cause
mos-1095 covered six acceptance suites; harness/verify scripts and the new 1186 seed helper were out of that file list.

## Class
BUG

## Acceptance
- No datetime.utcnow() in the four listed files
- Seeds and generated_at use timezone-aware UTC
- Related pytest suites stay green
