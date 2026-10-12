# Spec: Update feature card badges to match PRODUCT_CLAIMS_REGISTER.md

## Change
- Changed the status of the "Human transfer on request" card (M-TEL-02) from VERIFIED to UNDER_TEST in src/config/phone-ai-features.ts.
- Updated the corresponding entries in docs/competitive/PHONE_AI_FEATURE_INVENTORY.md to reflect the change.
- Updated the test expectations in scripts/phone-ai-features.test.mjs to expect 4 VERIFIED and 3 UNDER TEST cards.

## Verification
- All tests pass.
- Build succeeds.
- The remaining VERIFIED cards correspond to Verified rows in PRODUCT_CLAIMS_REGISTER.md:
  - M-TEL-01: V-02, V-03, V-05
  - M-CAL-02: O-03, O-04, O-05, O-06
  - M-POST-01: S-03, O-02
  - M-UK-01: V-02, O-04, O-05