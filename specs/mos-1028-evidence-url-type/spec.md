# mos-1028-evidence-url-type

## Goal
Contractor portal completion evidence_url input uses type=url so browsers and assistive tech treat it as a URL field matching server URL validation.

## Acceptance
- complete form evidence_url input has type="url"
- maxlength and optional labelling remain
- tests/test_evidence_url_type.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
