# mos-1027-dashboard-ai-reason-max

## Goal
Bound dashboard System Health AI side-effect control reason to AI_SIDE_EFFECT_REASON_MAX (500) before set_ai_side_effects, and surface overlong reasons as a Streamlit error instead of an uncaught ValueError.

## Acceptance
- dashboard System Health path checks control_reason against AI_SIDE_EFFECT_REASON_MAX
- overlong reason shows an error and does not call set_ai_side_effects
- tests/test_dashboard_ai_reason_max.py passes

## Out of scope
voice, deploy, secrets, frozen paths, commercial runtime flags.
