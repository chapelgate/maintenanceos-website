# S12 Plan

1. Reuse the existing certification card and governance links.
2. Change content only in src/app/security/page.tsx.
3. Build and inspect exported text, links and sitemap.
4. Commit and open a PR. Merge only after required green checks.
5. Verify live acceptance and record state.

## Throughput checkpoint
- Blocking first steps: skill preflight, latest main, spec and source inspection.
- Independent workstreams: one bounded content writer; parent owns spec and verification.
- Shared mutable state: disjoint page and spec files.
- Smallest safe decomposition: one page, no architecture or data-shape change.

## Analysis
Existing links cover disclosure and subprocessors. Status link and planned certification wording are missing. Keep current components and styling. Content-only exception in TASK_IMPL.md applies; no production logic is introduced. The public sitemap already includes /security/; no new route is required.
