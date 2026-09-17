# Concurrency 100 evidence pack

- Generated: `2026-09-16T23:59:33.578871+00:00`
- Baseline main SHA: `9e03f15c5baaecdc266800b241244e61855defcc`
- Branch HEAD SHA: `b442e903aae967f8594907eb2f3e07a383ec3db1`
- Branch: `cursor/concurrency-100-scale-d1b9`
- Verdict: **SIMULATED_ACCEPTANCE_PASS**

## Gates

```json
{
  "sim_ladder_100": true,
  "path_probe_12": true,
  "pytest_green": true,
  "redteam_green": true,
  "cross_leak": false,
  "recovery_ok": true,
  "ai_contexts_peak_100": true,
  "github_actions": "BLOCKED_actions_budget_exhausted"
}
```

## Ladder

```json
[
  {
    "target": 1,
    "pass_gate": true,
    "peak": 1,
    "ai_contexts_peak": 1,
    "unique_ai_contexts": 1,
    "p95_conn_ms": 12.208,
    "rss_kb": 67932,
    "cost_usd_est": 0.1,
    "bottleneck_class": "provider_quota_next",
    "gate_scope": "simulated_admission_db_and_mock_ai_contexts",
    "live_media_exercised": false
  },
  {
    "target": 5,
    "pass_gate": true,
    "peak": 5,
    "ai_contexts_peak": 5,
    "unique_ai_contexts": 5,
    "p95_conn_ms": 99.42,
    "rss_kb": 69724,
    "cost_usd_est": 0.5,
    "bottleneck_class": "provider_quota_next",
    "gate_scope": "simulated_admission_db_and_mock_ai_contexts",
    "live_media_exercised": false
  },
  {
    "target": 12,
    "pass_gate": true,
    "peak": 12,
    "ai_contexts_peak": 12,
    "unique_ai_contexts": 12,
    "p95_conn_ms": 244.063,
    "rss_kb": 73180,
    "cost_usd_est": 1.2,
    "bottleneck_class": "provider_quota_next",
    "gate_scope": "simulated_admission_db_and_mock_ai_contexts",
    "live_media_exercised": false
  },
  {
    "target": 25,
    "pass_gate": true,
    "peak": 25,
    "ai_contexts_peak": 25,
    "unique_ai_contexts": 25,
    "p95_conn_ms": 651.719,
    "rss_kb": 76252,
    "cost_usd_est": 2.5,
    "bottleneck_class": "provider_quota_next",
    "gate_scope": "simulated_admission_db_and_mock_ai_contexts",
    "live_media_exercised": false
  },
  {
    "target": 50,
    "pass_gate": true,
    "peak": 50,
    "ai_contexts_peak": 50,
    "unique_ai_contexts": 50,
    "p95_conn_ms": 774.684,
    "rss_kb": 80476,
    "cost_usd_est": 5.0,
    "bottleneck_class": "provider_quota_next",
    "gate_scope": "simulated_admission_db_and_mock_ai_contexts",
    "live_media_exercised": false
  },
  {
    "target": 75,
    "pass_gate": true,
    "peak": 75,
    "ai_contexts_peak": 75,
    "unique_ai_contexts": 75,
    "p95_conn_ms": 943.433,
    "rss_kb": 82628,
    "cost_usd_est": 7.5,
    "bottleneck_class": "provider_quota_next",
    "gate_scope": "simulated_admission_db_and_mock_ai_contexts",
    "live_media_exercised": false
  },
  {
    "target": 100,
    "pass_gate": true,
    "peak": 100,
    "ai_contexts_peak": 100,
    "unique_ai_contexts": 100,
    "p95_conn_ms": 1387.465,
    "rss_kb": 84400,
    "cost_usd_est": 10.0,
    "bottleneck_class": "provider_quota_next",
    "gate_scope": "simulated_admission_db_and_mock_ai_contexts",
    "live_media_exercised": false
  }
]
```

## Rollback

Reset to baseline `9e03f15c5baaecdc266800b241244e61855defcc` on main; do not merge this branch until Actions + N=2 live probe clear.

## Complete blockers

- HUMAN: raise/remove GitHub Actions spending limit (billing) so PR checks get runners
- CONTROLLED-CALL: run smallest real concurrency probe N=2 after isolated deploy (owner-authorised)
- OPTIONAL-NEXT: mocked media duplex load harness still short of live provider sockets
