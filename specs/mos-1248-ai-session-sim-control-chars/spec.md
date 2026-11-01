# mos-1248-ai-session-sim-control-chars
FEATURE: reject control characters in ai_session_sim open_mock_ai_session call_sid

## What
open_mock_ai_session accepts raw call_sid without control-char validation.

## Acceptance
- open_mock_ai_session raises on control chars in call_sid
- clean call_sid still creates session
