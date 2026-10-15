# QA

| Check | Result |
| --- | --- |
| `node --experimental-strip-types --test` on `scan.test.ts`, `scanner-v2-runtime.test.ts`, `src/lib/onboarding-create.test.ts` | 66 pass with the deploy and create a11y scripts in the same run |
| 403 and empty body, including the browser fetch, fetched 0 | outcome `blocked_by_site`, warning `blocked_by_site`, `ok: true` |
| Fetched pages plus `http_403`, and zero-fetch without 401/403 | not `blocked_by_site` |
| `/create` client | manual reason `blocked_by_site`, host line names `178.128.171.45`, `scan_blocked` stays ready |
| App spec | no `.do/app.yaml` or equivalent in the repo; snippet is in the pull request |

`npm test` 481 pass. `npx tsc --noEmit` pass. Static export of commit `880f481` then `node scripts/create-partial-scan-browser.mjs` printed `create-partial-scan-browser=ok`: the blocked panel named automated reading, typing or pasting, and `178.128.171.45`, and the services field accepted typed text on the next step.
