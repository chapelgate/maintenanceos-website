# Spec: public gas-safety strip and steps (10 Oct 2026)

## Goal Lock
OBJECTIVE: every page shows official public gas-emergency advice, and the rulebook carries full gas and carbon monoxide steps.
ACCEPTANCE:
- The site-wide static strip uses the owner's exact wording, has tel: links and is AA contrast.
- The hero microline links to `/how-we-keep-control/#gas`.
- The rulebook's first section is `#gas`.
- The compact block appears on the landlords, letting agents, housing associations and councils pages.
- No product claim, and no always-on or live wording.
EVIDENCE: `scripts/gas-safety.test.mjs`, the full test suite, the build, a live fetch after deploy, and the source citations in the PR.

## Sources (checked 10 Oct 2026)
- National Gas emergency contacts: https://www.nationalgas.com/emergency-contacts
- Gas Safe Register: https://www.gassaferegister.co.uk/gas-emergency/what-to-do-in-a-gas-emergency/ and /gas-safety/carbon-monoxide-poisoning/
- HSE: https://www.hse.gov.uk/gas/domestic/faqs.htm
- NHS: https://www.nhs.uk/conditions/carbon-monoxide-poisoning/
- nidirect (NI 0800 002 001): https://www.nidirect.gov.uk/articles/energy-power-supply-and-utilities

## Also
Fix og:image: it pointed at `/og-image.png/` (404) because `absoluteUrl` adds a trailing slash.
