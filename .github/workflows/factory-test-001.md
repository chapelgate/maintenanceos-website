---
on:
  workflow_dispatch:
permissions:
  contents: read
  copilot-requests: write
  issues: read
  pull-requests: read
engine: copilot
model: gpt-5-mini
network: defaults
safe-outputs:
  create-pull-request:
    max: 1
  add-comment:
    max: 5
---

# FACTORY TEST 001 — MaintenanceOS competitor benchmark transformation

Work as the implementation worker for GitHub issue #205 in this repository.

Read issue #205 in full and execute it end-to-end. The issue is the locked mission and acceptance contract.

## Execution rules

1. Inspect the existing repository and its tests before changing anything.
2. Research the current public competitors specified in issue #205 and additional credible UK competitors. Use evidence, not assumptions.
3. Select the strongest evidence-based primary website benchmark.
4. Implement the repository-contained website improvements. Do not stop at recommendations or an audit.
5. Reuse the existing application and components. Minimum code, minimum moving parts.
6. Preserve existing product functionality, especially /create and scanner/product behaviour.
7. Do not invent claims, customers, certifications, metrics, integrations, prices or capabilities.
8. Do not copy competitor text, branding, imagery, source or trade dress. Match or exceed useful patterns with original MaintenanceOS work.
9. Do not deploy production, change secrets, buy services, or create infrastructure.
10. Run the existing build/test/lint/typecheck suite and focused checks required by issue #205.
11. If anything fails, treat the failure as RETURN: diagnose it, make the smallest repair, and rerun. Continue until the required checks pass or a genuine human-only blocker is proven.
12. Create a reviewable pull request containing the implementation, docs/competitor-benchmark.md, docs/organic-growth-plan.md and test evidence.
13. In the PR body give a BEFORE GAP -> IMPLEMENTED CHANGE -> EVIDENCE/TEST matrix and list only genuine remaining human blockers.

Do not ask Andrew routine questions. Make evidence-based decisions autonomously. Success is a tested PR, not a prose answer.