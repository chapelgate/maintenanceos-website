# mos-1040-tenant-isolation

## Problem
Named acceptance for tenant isolation on voice mode env, operational log boundary, and secret-free tenant events is missing even though VOICE_TENANT_MODE and SAFE_EVENT_FIELDS already exist.

## Acceptance
- test_voice_tenant_mode_env
- test_isolation_boundary_in_operational_logging
- test_no_secret_in_tenant_event

## Scope
Tests (+ tiny helper lock if needed). No voice/deploy/frozen path edits.
