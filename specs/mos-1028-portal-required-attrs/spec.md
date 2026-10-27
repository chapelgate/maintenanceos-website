# mos-1028-portal-required-attrs

## Goal
Contractor portal required fields (availability start/end, completion note) declare HTML required so browsers and assistive tech match server fail-closed validation.

## Acceptance
- start and end inputs have required
- completion note textarea has required
- evidence_url stays optional (no required)
- tests/test_portal_required_attrs.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
