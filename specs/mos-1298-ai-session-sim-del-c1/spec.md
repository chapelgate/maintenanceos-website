# mos-1298-ai-session-sim-del-c1

## Goal
ai_session_sim._has_control_chars must reject DEL (U+007F) and C1 controls (U+0080–U+009F) in addition to existing C0 reject.

## Acceptance
- open_mock_ai_session raises ValueError on DEL/C1 in call_sid
- Existing C0 reject suite remains green
