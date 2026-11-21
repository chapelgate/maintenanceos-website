# SLO Dashboard (computed from real logs)

Generated: 2026-11-20 16:32 GMT

## Summary

### Global Dell Services SLOs

| SLO | Target | Current | Status |
|-----|--------|---------|--------|
| Router Availability | >=99.5% | 0.0% | FAIL |
| Cycle Success Rate | >=80% | 4.8% | FAIL |
| Time-to-Relaunch (avg) | <=60 min | 2945 min | FAIL |
| Time-to-Relaunch (p95) | <=120 min | 6150 min | FAIL |
| Builds Tracked | N/A | 235 | OK |
| Avg Relaunches per Build | <=2.0 | 1.0 | PASS |
| Max Relaunches | <=16 | 16 | PASS |

## Per-Product SLOs

### Router SLOs (chapelgate-omniroute-tunnel)

| SLO | Target | Current | Status | Source |
|-----|--------|---------|--------|--------|
| HTTP 200 Rate | >=99% | 0/1 checks | FAIL | Dell watch ALERTS.md |
| Avg Response Time | <=500ms | data pending | INFO | caddy-local metrics |
| Error Rate | <=1% | data pending | INFO | caddy-local logs |

### Build SLOs

| SLO | Target | Current | Status | Source |
|-----|--------|---------|--------|--------|
| Build Success Rate | >=95% | ~17% (41/235) | FAIL | JOB-STATE.md, systemd units |
| Avg Build Duration | <=60 min | data pending | INFO | systemd unit timestamps |
| Build Queue Wait Time | <=15 min | data pending | INFO | JOB-STATE.md |
| Consecutive Build Failures | 0 | 8 | FAIL | FAILURE-LOG.md |

### MaintenanceOS SLOs

| SLO | Target | Current | Status | Source |
|-----|--------|---------|--------|--------|
| Service Uptime | >=99.9% | data pending | INFO | systemd units + journals |
| STT Score Rate | >=80% | data pending | INFO | stt-improve-loop logs |
| Restart Rate (24h) | <=1 | data pending | INFO | systemd restart-count |

### Legal Case Management SLOs

| SLO | Target | Current | Status | Source |
|-----|--------|---------|--------|--------|
| Cross-tenancy Test Pass Rate | >=95% | data pending | INFO | mt-archify-loop5 logs |
| Data Separation Accuracy | 100% | data pending | INFO | legal-case-management logs |
| Tenant Filter Correctness | 100% | data pending | INFO | LCA evidence |

### Holiday Let Operator SLOs

| SLO | Target | Current | Status | Source |
|-----|--------|---------|--------|--------|
| Booking Validation Rate | >=98% | data pending | INFO | holiday-let-operator logs |
| Digest Generation | Daily | pending | INFO | golden-line-digest.timer |
| User Onboarding Time | <=24h | data pending | INFO | user setup logs |

### Council SLOs

| SLO | Target | Current | Status | Source |
|-----|--------|---------|--------|--------|
| Council Decision Turnaround | <=24h | data pending | INFO | council gates |
| PR Review Time | <=48h | data pending | INFO | github PR timers |
| Merge Success Rate | >=95% | data pending | INFO | merge logs |

### Repository Health SLOs

| SLO | Target | Current | Status | Source |
|-----|--------|---------|--------|--------|
| Inotify Watch Count | <=65536 | 61400+ | FAIL | readiness/security/INOTIFY-REPORT.md |
| Max Concurrent Jobs | <=250 | data pending | INFO | FAILURE-LOG.md |
| Disk Usage Alert Levels | staged@70% | root@93% | FAIL | readiness/security/DISK-REPORT.md |

## Measurement Sources

| Source | Type | Coverage |
|--------|------|----------|
| JOB-STATE.md | systemd unit states + last log timestamps | 80+ Dell user units |
| ALERTS.md | watchdog alerts and stale checks | all Dell jobs |
| FAILURE-LOG.md | failure counts and timestamps | all Dell jobs |
| systemctl --user list-units | service state, active/inactive/dead | all user units |
| journalctl --user | last log times, restart counts | all user journals |
| golden-line-digest.timer | daily digest generation | golden line emails |
| caddy-local metrics | HTTP response times | router services |
| mt-archify-loop5 | legal case management metrics | multi-tenancy |

## Per-Service SLO Tracking

Each service in dell-services/INVENTORY.md should track its own SLOs. Example format:

```
| Service | SLO | Target | Current | Status | Measurement Source |
```

The full SLO dashboard is regenerated every 15 min by the no-AI timer alongside JOB-STATE.md.