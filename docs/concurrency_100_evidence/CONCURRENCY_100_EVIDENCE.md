# Concurrency 100 evidence pack

- Generated: `2026-09-16T23:52:51.882447+00:00`
- Baseline main SHA: `9e03f15c5baaecdc266800b241244e61855defcc`
- Branch HEAD SHA: `75541e3cffd870138835f9aad8b0abed1e51b73c`
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
  "github_actions": "BLOCKED_empty_steps_cursor_bot_permissions"
}
```

## Ladder

```json
[
  {
    "target": 1,
    "pass_gate": true,
    "peak": 1,
    "p95_conn_ms": 9.762,
    "rss_kb": 67776,
    "cost_usd_est": 0.1,
    "bottleneck_class": "provider_quota_next"
  },
  {
    "target": 5,
    "pass_gate": true,
    "peak": 5,
    "p95_conn_ms": 115.522,
    "rss_kb": 69312,
    "cost_usd_est": 0.5,
    "bottleneck_class": "provider_quota_next"
  },
  {
    "target": 12,
    "pass_gate": true,
    "peak": 12,
    "p95_conn_ms": 241.91,
    "rss_kb": 72640,
    "cost_usd_est": 1.2,
    "bottleneck_class": "provider_quota_next"
  },
  {
    "target": 25,
    "pass_gate": true,
    "peak": 25,
    "p95_conn_ms": 593.781,
    "rss_kb": 76352,
    "cost_usd_est": 2.5,
    "bottleneck_class": "provider_quota_next"
  },
  {
    "target": 50,
    "pass_gate": true,
    "peak": 50,
    "p95_conn_ms": 824.491,
    "rss_kb": 80692,
    "cost_usd_est": 5.0,
    "bottleneck_class": "provider_quota_next"
  },
  {
    "target": 75,
    "pass_gate": true,
    "peak": 75,
    "p95_conn_ms": 1249.305,
    "rss_kb": 83232,
    "cost_usd_est": 7.5,
    "bottleneck_class": "provider_quota_next"
  },
  {
    "target": 100,
    "pass_gate": true,
    "peak": 100,
    "p95_conn_ms": 1229.545,
    "rss_kb": 84988,
    "cost_usd_est": 10.0,
    "bottleneck_class": "provider_quota_next"
  }
]
```

## Rollback

Reset to baseline `9e03f15c5baaecdc266800b241244e61855defcc` on main; do not merge this branch until Actions + N=2 live probe clear.

## Complete blockers

- HUMAN: enable GitHub Actions for cursor[bot] / fix org workflow permissions so PR checks actually run steps
- CONTROLLED-CALL: run smallest real concurrency probe N=2 after isolated deploy (owner-authorised)
