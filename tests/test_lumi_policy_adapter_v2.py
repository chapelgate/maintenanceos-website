from __future__ import annotations

import json
from pathlib import Path

import decision_engine
import voice_policy
from scripts import lumi_policy_adapter_v2 as adapter

ROOT = Path(__file__).resolve().parents[1]
SEED = ROOT / "tests" / "lumi_benchmark_v2_seed.json"


def _codes(rows):
    return [x["code"] for x in rows]


def test_adapter_matches_canonical_classify_on_all_seed_cases():
    cases = json.loads(SEED.read_text(encoding="utf-8"))
    for case in cases:
        text = "\n".join(case["input"]["turns"])
        canonical = decision_engine.classify(text)
        frozen = adapter.classify(text)
        assert _codes(frozen["safety_flags"]) == _codes(canonical["safety_flags"]), case["id"]
        assert frozen["human_review_required"] == canonical["human_review_required"], case["id"]


def test_adapter_matches_canonical_action_claim_detection():
    phrases = [
        "An engineer has already been dispatched.",
        "We have booked a plumber.",
        "Your appointment has been confirmed.",
        "I cannot confirm an engineer has been dispatched.",
        "A manager has been notified.",
        "Your repair has been completed.",
        "Your appointment has been cancelled.",
        "An engineer is on the way.",
    ]
    for phrase in phrases:
        assert adapter.detect_action_claims(phrase) == voice_policy.detect_action_claims(phrase), phrase


def test_adapter_matches_financial_confirmation_detection():
    phrases = [
        "Your refund has been issued.",
        "We cannot confirm any refund.",
        "Compensation was approved.",
        "No payment has been processed.",
    ]
    for phrase in phrases:
        assert bool(adapter.FALSE_FINANCIAL_CONFIRMATION.search(phrase)) == bool(
            voice_policy.FALSE_FINANCIAL_CONFIRMATION.search(phrase)
        ), phrase
