# mos-1059-product-profile-integration

## Problem
Product profile helpers exist but /health does not surface the active presentation title, and integration locks for overlay deny-keys / title consistency are incomplete.

## Acceptance
- product_title on /health matches api_title() for blank and worksmartos profiles
- overlay deny keys rejected; safe keys pass
- DENY_KEYS size 6; ALLOWED_PROFILES size 2
- module imports clean (no voice stack)

## Scope
api.py health allowlist + product_title; tests. No voice/deploy.
