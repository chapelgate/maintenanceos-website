# Build Readiness
## 1. Architecture and Boundaries
Status: APPLIES
Reason: Marketing robots/sitemap honesty lock only.
## 2. Data and Storage
Status: NOT_APPLICABLE
Reason: No data store or schema change.
## 3. Security and Privacy
Status: APPLIES
Reason: Keeps sample/status/buyer notes out of search indexes.
## 4. Reliability and Fallbacks
Status: NOT_APPLICABLE
Reason: No runtime product path changes.
## 5. Accessibility and UX
Status: APPLIES
Reason: Buyer-facing clarity that these routes are not public launch surfaces.
## 6. Testing and Verification
Status: APPLIES
Reason: node --test locks noindex, sitemap omission, and robots disallow.
## 7. Brand and Claims Honesty
Status: APPLIES
Reason: Prevents search discovery of non-public demo routes.
## 8. Operations and Rollback
Status: ALREADY_COVERED
Reason: Revert this commit. No deploy, nginx, or launch-flag change.
Artifact directory: specs/mw-65-noindex-sitemap-lock
