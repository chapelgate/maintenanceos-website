# mos-1028-bounded-text-default-max

## Goal
Name the _bounded_text default ceiling as BOUNDED_TEXT_DEFAULT_MAX so the fail-closed fallback is an explicit shared constant.

## Acceptance
- BOUNDED_TEXT_DEFAULT_MAX == 10000
- _bounded_text default maximum uses BOUNDED_TEXT_DEFAULT_MAX
- overlong text without explicit maximum is rejected at that ceiling
- tests/test_bounded_text_default_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
