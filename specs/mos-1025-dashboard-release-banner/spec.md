# mos-1025-dashboard-release-banner: System Health release honesty banner

## Goal
Surface a clear System Health banner from `readiness.release_status_banner` so operators see that `commercial_release_ready` false means SYNTHETIC ONLY, no sale, and no live personal data.

## Acceptance
- `tests/test_dashboard_release_banner.py` three tests pass.
- Dashboard System Health calls `release_status_banner` and shows warning when not ready.
- No deploy, voice, or frozen-path edits.

## Safety boundary
- Licence route: NONE.
