# Assessment: approved website review defects

Local and live review on 2026-10-11 found defects in this marketing site only:

- A zero-fetch PARTIAL scan was presented as an empty draft.
- Resumed scanner jobs with no fetched evidence were not reseeded, and skip reasons were dropped.
- `GasSafetyStrip` was mounted on every page.
- `/favicon.ico` 404ed.
- Spoken website replies used the browser voice, not the golden-line Gemini/Gacrux voice, and this repo has no website-owned key.
- PDF parser tests were cancelled, so `npm test` exited 1.
- `npm audit` reported high findings in `sharp` and `source-map-js`, plus a dev-only `braces` chain.
- The unauthenticated scan proxy allowed long URLs and a loose in-memory rate limit.
- `/about` described other sector product lines as if they belonged to this site.

The canonical host stays on the staging URL until a domain is chosen. The golden phone line, the Scanner V2 droplet, and maintenanceos-v1-pilot are out of scope.
