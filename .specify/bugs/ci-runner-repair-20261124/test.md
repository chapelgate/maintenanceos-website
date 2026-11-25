# Test — CI runner repair

Date: 2026-11-25

Verified criteria:

- Workflow regression tests require the version-matched Playwright container, host UID/GID, host networking, and the corrected HTTP port 3000 URL.
- Lighthouse remains a mobile audit with all four category thresholds at 90 and uses provided timing to remove synthetic runner variance.
- The full repository test, lint, typecheck, build, WebKit accessibility, and CI workflow checks are recorded by the factory `rt` wrapper before merge.
- Final verification requires a successful GitHub Actions run at the exact merged head and a repository runner list showing the active runner online.
