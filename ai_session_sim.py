"""Mock independent AI realtime session contexts (no provider charges).

Each admitted call claims a unique in-memory AI context id while the
simulated media bridge is "open". This is stronger than lease counting alone
but still not a live Gemini/OpenAI socket — evidence must label that honestly.
"""

from __future__ import annotations

import threading
import uuid
from dataclasses import dataclass


@dataclass(frozen=True)
class MockAISession:
    context_id: str
    call_sid: str
    call_session_id: int
    client_id: int


_LOCK = threading.Lock()
_SESSIONS: dict[int, MockAISession] = {}  # call_session_id -> session


def _has_control_chars(value: str) -> bool:
    return any(
        ord(ch) < 32
        or ord(ch) == 127
        or 0x80 <= ord(ch) <= 0x9F
        for ch in value
    )


def open_mock_ai_session(*, call_sid: str, call_session_id: int, client_id: int) -> MockAISession:
    if _has_control_chars(call_sid):
        raise ValueError("control characters not allowed")
    session = MockAISession(
        context_id=f"ai-{uuid.uuid4().hex}",
        call_sid=call_sid,
        call_session_id=call_session_id,
        client_id=client_id,
    )
    with _LOCK:
        if call_session_id in _SESSIONS:
            raise RuntimeError("duplicate_ai_session")
        _SESSIONS[call_session_id] = session
    return session


def close_mock_ai_session(call_session_id: int) -> None:
    with _LOCK:
        _SESSIONS.pop(call_session_id, None)


def active_mock_ai_sessions() -> int:
    with _LOCK:
        return len(_SESSIONS)


def mock_ai_context_ids() -> set[str]:
    with _LOCK:
        return {item.context_id for item in _SESSIONS.values()}


def reset_mock_ai_sessions() -> None:
    with _LOCK:
        _SESSIONS.clear()
