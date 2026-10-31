# mos-1045-demo-data

## Problem
Named acceptance that demo/synthetic tenants contain markers only (no live PII) is missing as a RELEASE_PLAN lock.

## Acceptance
- test_demo_tenant_has_synthetic_data_only
- test_no_live_pii_in_demo

## Scope
Tests over seed_synthetic_tenant / kit honesty. No frozen paths.
