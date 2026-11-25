# Assessment — CI runner repair (maintenanceos-website)

Date: 2026-11-25
Branch: `ci/fix-webkit-lighthouse-20261124`
Base head at assessment: `f9e77cf2bfe6e1f567f6c6782ee287c5d29faad2`

## Observed failures

| Run | Job | Conclusion | Root cause |
| --- | --- | --- | --- |
| 45576376981 | WebKit Accessibility Checks | failure | `tests/webkit-a11y/a11y-simple.test.mjs` navigated to `https://localhost:3515` while the workflow serves the static export on `http://localhost:3000`; every check failed with `net::ERR_CONNECTION_REFUSED`. The estate runner also lacks WebKit shared libraries and `sudo -n` is unavailable, so `npx playwright install webkit` produced a browser that cannot launch. |
| 45532763948 | Lighthouse CI | failure | `lighthouse@latest` floated; homepage mobile performance scored 84 < 90 on the merged head although the same 13.6.0 release scored 90 on run 44977069985. Version drift plus run variance. |
| 45532764344 | estate-gate.yml | failure | Generated zero jobs: the PR body carried no `Estate-Route`/`Estate-Artifact` metadata, so the reusable gate could not validate a route. |

## Scope of this repair

CI workflow and test-harness defects only. No product runtime behaviour, no deployment, no DNS, no secrets, no production surface. The runner-registration finding from the brief is unchanged: runner id 28 `estate-jobs-maintenanceos-website` is offline and has no local credentials or installation path anywhere on this host; runner id 29 `andy-Precision-5820-Tower` is online and is the runner that actually serves this repository. No re-registration token is required for the repository CI path.

## Risk

Low. The workflow change swaps a host browser install for a pinned container image, changes no application code, and the only source change is an explicit TypeScript import extension required by the repo's own `node --experimental-strip-types` test command.
