# Local Observability Honesty

Status: PROCESS-LOCAL ONLY / NOT CENTRAL MONITORING

`operational_logging.py` emits redacted JSON to a process-local stream handler when `ENABLE_STRUCTURED_LOGGING=true`. Propagation is disabled. This is not central, tamper-resistant, access-controlled monitoring. Production acceptance still requires the central path described in INCIDENT_OBSERVABILITY_MATRIX.md. Do not treat a green local suite as incident-readiness for a live host.
