# Test

`scripts/council-decisions.test.mjs` locks the intended host away from the live canonical, the repair-intake create hero, the cookies page (events are not sent to Railway), and the voluntary accessibility note.

`npm test` passed: 270 script tests and 455 package and `src/lib` tests. eslint and `tsc --noEmit` passed.

axe-core 4.10.3 in Playwright WebKit 26.6, against the local static export at 1440 by 900, reported no violations on `/`, `/create/`, `/demo/`, `/features/`, `/pricing/`, `/security/`, and `/accessibility/`. Each returned HTTP 200, had one level-1 heading, did not overflow, and recorded no uncaught page error. Canonical URLs in that export stayed on `https://seahorse-app-4oasq.ondigitalocean.app`.

Verdict: verified locally before merge. Physical Safari and assistive technology remain on the owner list.
