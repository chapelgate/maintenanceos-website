# mw-truthful-marketing-claims-lock fix

## Change
Added `scripts/truthful-marketing-claims-lock.test.mjs` with 9 tests validating the signed claims register covers all VERIFIED rows, denies live phone/GA claims, references product checkpoint SHA `498ad82dd87631814195d447d89458480b117951`, and cross-links V-claims to docs/STEP8_SAFE_AUTOMATION_MODEL.md. Specs/build-readiness.md committed alongside.

## Tests
9/9 pass locally. Lint clean. Typecheck clean. Build green.
