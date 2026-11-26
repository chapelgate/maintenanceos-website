# QMS Evidence Plan — maintenanceos-website

## Approach
1. Create docs/quality/ directory with 13 QMS documents
2. Each document maps to specific ISO 9001:2015 clauses
3. Each document cites real evidence paths in this repo
4. Commit on feature branch
5. Open PR with Estate-Route: FEATURE
6. Council review (Council A + Council B)
7. On GO: merge at exact head

## Evidence
- CI workflows: .github/workflows/*.yml
- Tests: tests/ (language-specific)
- FAILURE-LOG: /root/jobs-work/readiness/FAILURE-LOG.md
- Council verdicts: out/council-*/council-*.md
