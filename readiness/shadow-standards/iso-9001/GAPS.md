# iso-9001 — GAPS.md

## Gap: QMS evidence not yet assembled for all 12 product repos
**Requirement**: ISO 9001:2015 clauses 4-10 (context, leadership, planning, support, operation, performance evaluation, improvement).
**Free fix**: Gather real repo path/commit evidence per clause; wire each clause to an existing Dell service/script/test.
**Owner job**: shadow-iso9001-r1 (this job) — complete evidence collection and obtain council GO.

## Gap: Signed DPIAs for all 12 products outside documentation scope
**Requirement**: UK GDPR Art 35 / ISO 9001 planning support (risk-based thinking, documented processes).
**Free fix**: Draft DPIAs exist in council-compliance-pack-20261115/compliance/model-cards/ but need DPO/Chapelgate legal sign-off.
**Owner job**: compliance-cert-costs-20261115 / DPO legal review (Andy-only).

## Gap: CI gates for QMS-related checks not yet wired
**Requirement**: ISO 9001:2015 clause 8 (operation control), clause 9 (performance evaluation).
**Free fix**: Add council-reviewed PRs to wire QMS gap-close scripts into CI on all 12 repos.
**Owner job**: shadow-iso9001-r1 — council-reviewed PR per repo.

## Gap: API contracts/OpenAPI schemas documented but not enforced in CI
**Requirement**: ISO 9001:2015 clause 8 (controlled operation).
**Free fix**: Enforce OpenAPI contracts in CI gates on the 12 product repos.
**Owner job**: council-reviewed PRs per repo.