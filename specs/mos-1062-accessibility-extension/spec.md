# mos-1062-accessibility-extension

## Problem
RELEASE_PLAN requires named accessibility/boundary locks (skip link, main, lang, viewport, labels, maxlength, no secret leak on errors, locked security headers on health).

## Acceptance
Named tests in tests/test_mos_1062_accessibility_extension.py covering portal page structure, form labels/required/maxlength, and health security header locks.

## Scope
Tests locking existing behaviour; minimal portal/_portal_page fixes only if a lock fails. No voice/deploy.
