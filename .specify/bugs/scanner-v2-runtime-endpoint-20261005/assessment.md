# Assessment

## Goal lock

OBJECTIVE -> route the existing website scan Function to the already-deployed DigitalOcean Scanner V2 runtime.

ACCEPTANCE CRITERION -> same-origin `/api/website/scan` returns Scanner V2 results from release `cadce5cf66740984aefb81c290265abe45c7ecd0`; SSRF denial remains intact; no telephony or infrastructure change.

EVIDENCE/BLOCKER -> direct DigitalOcean Scanner V2 HTTPS returned HTTP 200 and COMPLETE, while the live Function still returned HTTP 200 from obsolete fallback runtime `0a48dfa...`. A guarded App env cutover did not change the Function runtime and automatically restored the prior App spec.

NEXT ACTION -> replace only the obsolete fallback URL in Function source and its committed prebuilt bundle, validate, deploy, and live-test.

## Reuse / preflight

- Reuse the existing Function, route, Scanner droplet and HTTPS edge.
- No new service, queue, database, router, host, credential or control plane.
- Production telephony, voice and golden phone line are untouched.
- Work class: BUG.
