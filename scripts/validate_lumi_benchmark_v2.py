#!/usr/bin/env python3
"""Offline integrity gate for the MaintenanceOS LUMI Benchmark V2 corpus.

Zero network access. Zero model calls. Zero GPU use.
Fails closed on schema defects, semantic duplicates, cosmetic duplicates,
or scenario-family leakage across evaluation splits.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any, Iterable

ALLOWED_SPLITS = {"development", "selection_validation", "hidden_final"}
ALLOWED_OS = {
    "LandlordOS",
    "LettingAgentOS",
    "PropertyManagerOS",
    "MaintenanceOS",
    "HousingAssociationOS",
    "FacilitiesOS",
    "CouncilOS",
    "HolidayLetOS",
}
ALLOWED_CHANNELS = {"text", "voice_transcript", "email", "api"}
ALLOWED_PRIORITIES = {"P1", "P2", "P3", "P4", "NONE"}
ALLOWED_PROVENANCE = {"hand_authored", "backported_fixture", "synthetic_generated"}

_NUMBER = re.compile(r"\b\d+(?:[.,]\d+)?\b")
_SPACE = re.compile(r"\s+")


def _need(obj: dict[str, Any], key: str, typ: type, where: str, errors: list[str]) -> Any:
    value = obj.get(key)
    if not isinstance(value, typ):
        errors.append(f"{where}.{key} must be {typ.__name__}")
    return value


def _norm_surface(turns: Iterable[str]) -> str:
    text = " ".join(str(x).lower().strip() for x in turns)
    text = _NUMBER.sub("<num>", text)
    text = re.sub(r"[^a-z0-9<> ]+", " ", text)
    return _SPACE.sub(" ", text).strip()


def _canon(value: Any) -> Any:
    if isinstance(value, dict):
        return {k: _canon(value[k]) for k in sorted(value)}
    if isinstance(value, list):
        return sorted((_canon(x) for x in value), key=lambda x: json.dumps(x, sort_keys=True))
    if isinstance(value, str):
        return value.strip().lower()
    return value


def semantic_signature(case: dict[str, Any]) -> str:
    return json.dumps(_canon(case.get("signature", {})), sort_keys=True, separators=(",", ":"))


def decision_dimensions(case: dict[str, Any]) -> tuple[Any, ...]:
    ctx = case.get("context", {})
    inp = case.get("input", {})
    exp = case.get("expected", {})
    sig = case.get("signature", {})
    return (
        case.get("family"),
        ctx.get("industry_os"),
        ctx.get("caller_role"),
        ctx.get("channel"),
        bool(ctx.get("reception_mode")),
        inp.get("transcript_condition"),
        inp.get("adversarial_mechanism"),
        sig.get("decision_boundary"),
        sig.get("interaction_pattern"),
        sig.get("failure_mechanism"),
        tuple(sorted(exp.get("hazard_codes") or [])),
        exp.get("priority"),
        bool(exp.get("must_escalate")),
        tuple(sorted(exp.get("permitted_side_effects") or [])),
        exp.get("privacy_boundary"),
    )


def validate_case(case: dict[str, Any], idx: int) -> list[str]:
    errors: list[str] = []
    where = f"row[{idx}]"
    if not isinstance(case, dict):
        return [f"{where} must be object"]

    cid = _need(case, "id", str, where, errors)
    split = _need(case, "split", str, where, errors)
    family = _need(case, "family", str, where, errors)
    ctx = _need(case, "context", dict, where, errors)
    inp = _need(case, "input", dict, where, errors)
    exp = _need(case, "expected", dict, where, errors)
    sig = _need(case, "signature", dict, where, errors)
    prov = _need(case, "provenance", dict, where, errors)

    if isinstance(cid, str) and not cid.strip():
        errors.append(f"{where}.id must be non-empty")
    if isinstance(split, str) and split not in ALLOWED_SPLITS:
        errors.append(f"{where}.split invalid: {split}")
    if isinstance(family, str) and not family.strip():
        errors.append(f"{where}.family must be non-empty")

    if isinstance(ctx, dict):
        if ctx.get("industry_os") not in ALLOWED_OS:
            errors.append(f"{where}.context.industry_os invalid")
        if ctx.get("channel") not in ALLOWED_CHANNELS:
            errors.append(f"{where}.context.channel invalid")
        if not isinstance(ctx.get("caller_role"), str) or not ctx.get("caller_role", "").strip():
            errors.append(f"{where}.context.caller_role must be non-empty")
        if "reception_mode" in ctx and not isinstance(ctx["reception_mode"], bool):
            errors.append(f"{where}.context.reception_mode must be boolean")

    if isinstance(inp, dict):
        turns = inp.get("turns")
        if not isinstance(turns, list) or not turns or not all(isinstance(x, str) and x.strip() for x in turns):
            errors.append(f"{where}.input.turns must be non-empty strings")

    if isinstance(exp, dict):
        if exp.get("priority") not in ALLOWED_PRIORITIES:
            errors.append(f"{where}.expected.priority invalid")
        if not isinstance(exp.get("must_escalate"), bool):
            errors.append(f"{where}.expected.must_escalate must be boolean")
        if not isinstance(exp.get("permitted_side_effects"), list):
            errors.append(f"{where}.expected.permitted_side_effects must be list")
        for key in ("hazard_codes", "required_information", "forbidden_claims"):
            if key in exp and not isinstance(exp[key], list):
                errors.append(f"{where}.expected.{key} must be list")

    if isinstance(sig, dict):
        facts = sig.get("causal_facts")
        if not isinstance(facts, list) or not facts or not all(isinstance(x, str) and x.strip() for x in facts):
            errors.append(f"{where}.signature.causal_facts must be non-empty strings")
        for key in ("decision_boundary", "interaction_pattern"):
            if not isinstance(sig.get(key), str) or not sig.get(key, "").strip():
                errors.append(f"{where}.signature.{key} must be non-empty")

    if isinstance(prov, dict):
        if prov.get("source_type") not in ALLOWED_PROVENANCE:
            errors.append(f"{where}.provenance.source_type invalid")
        if not isinstance(prov.get("source_ref"), str) or not prov.get("source_ref", "").strip():
            errors.append(f"{where}.provenance.source_ref must be non-empty")
        if prov.get("reviewed") is not True:
            errors.append(f"{where}.provenance.reviewed must be true before benchmark use")

    return errors


def validate_corpus(cases: list[dict[str, Any]]) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []

    if not isinstance(cases, list) or not cases:
        return {"passed": False, "errors": ["corpus must be a non-empty list"], "warnings": []}

    for i, case in enumerate(cases):
        errors.extend(validate_case(case, i))

    ids = [c.get("id") for c in cases if isinstance(c, dict)]
    dup_ids = sorted(k for k, v in Counter(ids).items() if k and v > 1)
    for cid in dup_ids:
        errors.append(f"duplicate id: {cid}")

    sig_map: defaultdict[str, list[str]] = defaultdict(list)
    for c in cases:
        if isinstance(c, dict):
            sig_map[semantic_signature(c)].append(str(c.get("id")))
    for ids_for_sig in sig_map.values():
        if len(ids_for_sig) > 1:
            errors.append("duplicate substantive signature: " + ", ".join(sorted(ids_for_sig)))

    family_splits: defaultdict[str, set[str]] = defaultdict(set)
    family_ids: defaultdict[str, list[str]] = defaultdict(list)
    for c in cases:
        if not isinstance(c, dict):
            continue
        family = str(c.get("family") or "")
        split = str(c.get("split") or "")
        if family and split:
            family_splits[family].add(split)
            family_ids[family].append(str(c.get("id")))
    for family, splits in sorted(family_splits.items()):
        if len(splits) > 1:
            errors.append(
                f"scenario-family split leakage: {family} appears in {sorted(splits)} "
                f"({', '.join(family_ids[family])})"
            )

    surfaces: list[tuple[str, str, tuple[Any, ...]]] = []
    for c in cases:
        if not isinstance(c, dict):
            continue
        turns = ((c.get("input") or {}).get("turns") or [])
        surfaces.append((str(c.get("id")), _norm_surface(turns), decision_dimensions(c)))

    for i in range(len(surfaces)):
        ida, ta, da = surfaces[i]
        if not ta:
            continue
        for j in range(i + 1, len(surfaces)):
            idb, tb, db = surfaces[j]
            if not tb:
                continue
            similarity = SequenceMatcher(None, ta, tb).ratio()
            dimension_diff = sum(a != b for a, b in zip(da, db))
            if similarity >= 0.98 and dimension_diff <= 1:
                errors.append(
                    f"cosmetic/near duplicate: {ida} vs {idb} "
                    f"(surface={similarity:.3f}, substantive_dimensions_changed={dimension_diff})"
                )
            elif similarity >= 0.92 and dimension_diff <= 1:
                warnings.append(
                    f"review near duplicate: {ida} vs {idb} "
                    f"(surface={similarity:.3f}, substantive_dimensions_changed={dimension_diff})"
                )

    canonical_bytes = json.dumps(_canon(cases), sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    corpus_sha256 = hashlib.sha256(canonical_bytes).hexdigest()
    split_digests = {}
    for split in sorted(ALLOWED_SPLITS):
        subset = [x for x in cases if isinstance(x, dict) and x.get("split") == split]
        payload = json.dumps(_canon(subset), sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
        split_digests[split] = hashlib.sha256(payload).hexdigest()

    split_counts = Counter(str(c.get("split")) for c in cases if isinstance(c, dict))
    os_counts = Counter((c.get("context") or {}).get("industry_os") for c in cases if isinstance(c, dict))
    priority_counts = Counter((c.get("expected") or {}).get("priority") for c in cases if isinstance(c, dict))
    critical_count = sum(
        1 for c in cases
        if isinstance(c, dict) and ((c.get("expected") or {}).get("must_escalate") is True)
    )

    return {
        "passed": not errors,
        "errors": errors,
        "warnings": warnings,
        "summary": {
            "cases": len(cases),
            "unique_ids": len(set(ids)),
            "unique_signatures": len(sig_map),
            "families": len(family_splits),
            "critical_cases": critical_count,
            "split_counts": dict(split_counts),
            "industry_os_counts": dict(os_counts),
            "priority_counts": dict(priority_counts),
            "corpus_sha256": corpus_sha256,
            "split_sha256": split_digests,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("corpus", type=Path)
    args = parser.parse_args()
    cases = json.loads(args.corpus.read_text(encoding="utf-8"))
    report = validate_corpus(cases)
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
