# mos-1027-portal-input-maxlength

## Goal
Expose server input bounds on contractor portal HTML controls via maxlength so browsers and AT prevent overlong entry before submit.

## Acceptance
- availability form start/end inputs carry maxlength=AVAILABILITY_DATETIME_TEXT_MAX
- complete form note textarea carries maxlength=COMPLETION_NOTE_MAX
- complete form evidence_url input carries maxlength=EVIDENCE_URL_MAX
- tests/test_portal_input_maxlength.py passes
- existing contractor portal a11y tests still pass

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
