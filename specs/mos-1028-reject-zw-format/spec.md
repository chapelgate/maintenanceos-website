# mos-1028-reject-zw-format

## Goal
Reject zero-width and format characters (ZWSP, ZWNJ, ZWJ, LRM, RLM, BOM, WJ) in _reject_control_chars.

## Acceptance
- _ZW_FORMAT frozenset locked
- inputs containing those chars raise HTTP 400
- tests/test_reject_zw_format.py and test_reject_del_bidi.py pass

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
