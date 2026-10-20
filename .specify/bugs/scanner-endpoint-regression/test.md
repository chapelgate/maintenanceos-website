# Test

verified: validate and webkit-a11y passed on revert head 822ac0f (runs 39480382046 and 39480382001). Acceptance after deploy: the live JS bundle on worksmartos.co.uk contains onboardingScanEndpoint:"/api/website/scan" and no seahorse-app URL, and POST /api/website/scan returns 200.
