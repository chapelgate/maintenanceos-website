"""Inspection comparison for housing maintenance units.

Adapted from Pango (https://github.com/vul-os/pango), commit ba1e085.
Original: backend/internal/inspect/ (ingoing/outgoing inspection comparison).
Licence: MIT OR Apache-2.0 (commercially compatible; reuse with attribution).
Chapelgate implementation is a clean-room Python functional reimplementation:
no copied code, schemas, identifiers, strings, test data or text.
Reuses unit_normalisation from d-01 (shared foundation).
"""


from __future__ import annotations

from typing import Any


class ConditionDelta:
    """Per-item delta between two inspections."""

    def __init__(
        self,
        itemKey: str,
        ingoingCondition: str | None,
        outgoingCondition: str | None,
        deteriorated: bool | None,
        improved: bool | None,
        comment: str | None = None,
        photoRefs: list[str] | None = None,
    ):
        self.itemKey = itemKey
        self.ingoingCondition = ingoingCondition
        self.outgoingCondition = outgoingCondition
        self.deteriorated = deteriorated
        self.improved = improved
        self.comment = comment
        self.photoRefs = photoRefs


def _build_lookup(inspection: dict[str, Any]) -> dict[str, str]:
    """Build itemKey -> condition lookup from inspection items + findings.

    Findings take precedence over items.
    """
    lookup: dict[str, str] = {}

    # Items first
    for item in inspection.get("items", []):
        key = item.get("itemKey", "")
        cond = item.get("condition", "")
        if key:
            lookup[key] = cond

    # Findings override items
    for finding in inspection.get("findings", []):
        key = finding.get("itemKey", "")
        cond = finding.get("condition", "")
        if key:
            lookup[key] = cond

    return lookup


def compare_inspections(
    ingoing: dict[str, Any],
    outgoing: dict[str, Any],
) -> list[ConditionDelta]:
    """Compare two inspections and return per-item deltas.

    Args:
        ingoing: Ingoing inspection dict with templateId, items, findings.
        outgoing: Outgoing inspection dict with templateId, items, findings.

    Returns:
        List of ConditionDelta objects, one per item key present in either
        inspection. Findings take precedence over items within each inspection.
        orgId-scoped (tenant isolation): caller ensures org filtering.
    """
    ingoing_lookup = _build_lookup(ingoing)
    outgoing_lookup = _build_lookup(outgoing)

    all_keys = set(ingoing_lookup.keys()) | set(outgoing_lookup.keys())

    result: list[ConditionDelta] = []

    for key in sorted(all_keys):
        ingoingCondition = ingoing_lookup.get(key)
        outgoingCondition = outgoing_lookup.get(key)

        if ingoingCondition is not None and outgoingCondition is not None:
            if ingoingCondition == outgoingCondition:
                # Both present and equal: no change
                delta = ConditionDelta(
                    itemKey=key,
                    ingoingCondition=ingoingCondition,
                    outgoingCondition=outgoingCondition,
                    deteriorated=False,
                    improved=False,
                )
            else:
                # Both present and differ: deterioration
                delta = ConditionDelta(
                    itemKey=key,
                    ingoingCondition=ingoingCondition,
                    outgoingCondition=outgoingCondition,
                    deteriorated=True,
                    improved=False,
                )
        elif ingoingCondition is None and outgoingCondition is not None:
            # Ingoing missing, outgoing present: improved
            delta = ConditionDelta(
                itemKey=key,
                ingoingCondition=None,
                outgoingCondition=outgoingCondition,
                deteriorated=False,
                improved=True,
            )
        elif ingoingCondition is not None and outgoingCondition is None:
            # Ingoing present, outgoing missing: deteriorated
            delta = ConditionDelta(
                itemKey=key,
                ingoingCondition=ingoingCondition,
                outgoingCondition=None,
                deteriorated=True,
                improved=False,
            )
        else:
            # Both None - should not happen since key is in union, but safety
            delta = ConditionDelta(
                itemKey=key,
                ingoingCondition=None,
                outgoingCondition=None,
                deteriorated=None,
                improved=None,
            )

        result.append(delta)

    return result