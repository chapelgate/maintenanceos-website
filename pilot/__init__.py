"""Chapelgate limited pilot control plane (Lane A minimal guard)."""

from pilot.abort import PilotAbortError, assert_not_aborted, evaluate_pilot_abort
from pilot.chapelgate_config import chapelgate_pilot_mode_config, pilot_armed
from pilot.runtime_guard import (
    PilotAdmitRejected,
    admit_pilot_call,
    evaluate_signals_and_maybe_abort,
    is_pilot_mode_armed,
    pilot_status,
    record_pilot_call_completed,
    reset_pilot_runtime_for_tests,
)
from pilot.scorecard import PilotScorecard, apply_scorecard_event, empty_scorecard

__all__ = [
    "PilotAbortError",
    "PilotAdmitRejected",
    "PilotScorecard",
    "admit_pilot_call",
    "apply_scorecard_event",
    "assert_not_aborted",
    "chapelgate_pilot_mode_config",
    "empty_scorecard",
    "evaluate_pilot_abort",
    "evaluate_signals_and_maybe_abort",
    "is_pilot_mode_armed",
    "pilot_armed",
    "pilot_status",
    "record_pilot_call_completed",
    "reset_pilot_runtime_for_tests",
]
