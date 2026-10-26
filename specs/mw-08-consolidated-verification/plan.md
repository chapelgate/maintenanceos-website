# Plan
1. Add scripts/consolidated-verification.mjs running build, test, lint, typecheck, security:live (non-strict), performance budget, accessibility check, functional smoke, and release marker SHA check against HEAD
2. Acceptance: script exits 0 on clean main and reports exact HEAD SHA + all gate results
