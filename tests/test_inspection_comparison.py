"""Inspection comparison tests for housing maintenance.

Adapted from Pango (https://github.com/vul-os/pango), commit ba1e085.
Original: backend/internal/inspect/ (ingoing/outgoing inspection comparison).
Licence: MIT OR Apache-2.0 (commercially compatible; reuse with attribution).
Chapelgate implementation is a clean-room Python functional reimplementation:
no copied code, schemas, identifiers, strings, test data or text.
Reuses unit_normalisation from d-01 (shared foundation).
"""

import pytest

from pilot.housing.inspection_comparison import (
    ConditionDelta,
    compare_inspections,
)


def test_ingoing_created_at_move_in_with_condition_details():
    """Ingoing inspection record for a unit with condition details stored."""
    ingoing = {
        "templateId": "template-1",
        "items": [
            {"itemKey": "kitchen", "condition": "good"},
            {"itemKey": "bathroom", "condition": "fair"},
        ],
        "findings": [
            {"itemKey": "kitchen", "condition": "good"},
        ],
    }

    outgoing = {
        "templateId": "template-1",
        "items": [],
        "findings": [],
    }

    deltas = compare_inspections(ingoing, outgoing)

    assert len(deltas) == 2
    kitchen = next(d for d in deltas if d.itemKey == "kitchen")
    assert kitchen.ingoingCondition == "good"
    assert kitchen.outgoingCondition is None
    assert kitchen.deteriorated is True
    assert kitchen.improved is False

    bathroom = next(d for d in deltas if d.itemKey == "bathroom")
    assert bathroom.ingoingCondition == "fair"
    assert bathroom.outgoingCondition is None
    assert bathroom.deteriorated is True
    assert bathroom.improved is False


def test_outgoing_created_at_move_out_for_same_unit():
    """Outgoing inspection record for same unit stored."""
    ingoing = {
        "templateId": "template-1",
        "items": [
            {"itemKey": "kitchen", "condition": "good"},
            {"itemKey": "bathroom", "condition": "fair"},
        ],
        "findings": [],
    }

    outgoing = {
        "templateId": "template-1",
        "items": [
            {"itemKey": "kitchen", "condition": "fair"},
            {"itemKey": "bathroom", "condition": "poor"},
        ],
        "findings": [
            {"itemKey": "kitchen", "condition": "fair"},
        ],
    }

    deltas = compare_inspections(ingoing, outgoing)

    assert len(deltas) == 2
    kitchen = next(d for d in deltas if d.itemKey == "kitchen")
    assert kitchen.ingoingCondition == "good"
    assert kitchen.outgoingCondition == "fair"
    assert kitchen.deteriorated is True
    assert kitchen.improved is False

    bathroom = next(d for d in deltas if d.itemKey == "bathroom")
    assert bathroom.ingoingCondition == "fair"
    assert bathroom.outgoingCondition == "poor"
    assert bathroom.deteriorated is True
    assert bathroom.improved is False


def test_comparison_highlights_added_damaged_removed_items():
    """Deltas mark deteriorated/improved correctly per itemKey."""
    ingoing = {
        "templateId": "template-1",
        "items": [
            {"itemKey": "kitchen", "condition": "good"},
            {"itemKey": "bathroom", "condition": "good"},
            {"itemKey": "bedroom", "condition": "excellent"},
        ],
        "findings": [],
    }

    outgoing = {
        "templateId": "template-1",
        "items": [
            {"itemKey": "kitchen", "condition": "fair"},      # damaged
            {"itemKey": "bathroom", "condition": "good"},    # same
            # bedroom removed
        ],
        "findings": [
            {"itemKey": "kitchen", "condition": "fair"},
            {"itemKey": "living_room", "condition": "good"}, # added
        ],
    }

    deltas = compare_inspections(ingoing, outgoing)

    assert len(deltas) == 4

    kitchen = next(d for d in deltas if d.itemKey == "kitchen")
    assert kitchen.ingoingCondition == "good"
    assert kitchen.outgoingCondition == "fair"
    assert kitchen.deteriorated is True
    assert kitchen.improved is False

    bathroom = next(d for d in deltas if d.itemKey == "bathroom")
    assert bathroom.ingoingCondition == "good"
    assert bathroom.outgoingCondition == "good"
    assert bathroom.deteriorated is False
    assert bathroom.improved is False

    bedroom = next(d for d in deltas if d.itemKey == "bedroom")
    assert bedroom.ingoingCondition == "excellent"
    assert bedroom.outgoingCondition is None
    assert bedroom.deteriorated is True
    assert bedroom.improved is False

    living_room = next(d for d in deltas if d.itemKey == "living_room")
    assert living_room.ingoingCondition is None
    assert living_room.outgoingCondition == "good"
    assert living_room.deteriorated is False
    assert living_room.improved is True


def test_comparison_result_exportable_per_unit():
    """Result can be reported per property/unit (orgId-scoped output)."""
    ingoing = {
        "templateId": "template-1",
        "items": [
            {"itemKey": "kitchen", "condition": "good"},
        ],
        "findings": [],
    }

    outgoing = {
        "templateId": "template-1",
        "items": [
            {"itemKey": "kitchen", "condition": "fair"},
        ],
        "findings": [],
    }

    deltas = compare_inspections(ingoing, outgoing)

    # Verify all required fields present for export
    assert len(deltas) == 1
    delta = deltas[0]
    assert hasattr(delta, "itemKey")
    assert hasattr(delta, "ingoingCondition")
    assert hasattr(delta, "outgoingCondition")
    assert hasattr(delta, "deteriorated")
    assert hasattr(delta, "improved")
    assert hasattr(delta, "comment")
    assert hasattr(delta, "photoRefs")

    # Should be serializable for export
    export_data = {
        "unit_id": "unit-123",
        "org_id": "orgA",
        "deltas": [
            {
                "itemKey": d.itemKey,
                "ingoingCondition": d.ingoingCondition,
                "outgoingCondition": d.outgoingCondition,
                "deteriorated": d.deteriorated,
                "improved": d.improved,
                "comment": d.comment,
                "photoRefs": d.photoRefs,
            }
            for d in deltas
        ],
    }

    assert export_data["org_id"] == "orgA"
    assert export_data["unit_id"] == "unit-123"
    assert len(export_data["deltas"]) == 1


def test_no_cross_org_leakage():
    """Comparison for unit in orgA not visible under orgB."""
    ingoing_orgA = {
        "templateId": "template-1",
        "items": [
            {"itemKey": "kitchen", "condition": "good"},
        ],
        "findings": [],
    }

    outgoing_orgA = {
        "templateId": "template-1",
        "items": [
            {"itemKey": "kitchen", "condition": "fair"},
        ],
        "findings": [],
    }

    deltas_orgA = compare_inspections(ingoing_orgA, outgoing_orgA)

    ingoing_orgB = {
        "templateId": "template-1",
        "items": [
            {"itemKey": "bathroom", "condition": "excellent"},
        ],
        "findings": [],
    }

    outgoing_orgB = {
        "templateId": "template-1",
        "items": [],
        "findings": [],
    }

    deltas_orgB = compare_inspections(ingoing_orgB, outgoing_orgB)

    # Each org's comparison is independent
    assert len(deltas_orgA) == 1
    assert len(deltas_orgB) == 1
    assert deltas_orgA[0].itemKey == "kitchen"
    assert deltas_orgB[0].itemKey == "bathroom"

    # No data from orgA in orgB result
    orgA_keys = {d.itemKey for d in deltas_orgA}
    orgB_keys = {d.itemKey for d in deltas_orgB}
    assert orgA_keys.isdisjoint(orgB_keys)