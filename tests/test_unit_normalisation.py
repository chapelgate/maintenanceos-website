"""Unit normalisation tests for housing maintenance."""

import pytest

from pilot.housing.unit_normalisation import (
    normalise_unit_key,
    normalise_default,
    normalise_mixed_use,
    normalise_verbatim,
    UnitNormalisationError,
    UNIT_SCHEME,
    UNIT_ATTRIBUTES,
)


def test_default_scheme_flats_flat_3a_to_3a():
    result = normalise_unit_key("default", "Flat 3A")
    assert result == "3a"


def test_default_scheme_variants_all_3a():
    variants = ["3A", "flat 3a", "3 A", "FLAT-3A", "No. 3a"]
    for v in variants:
        result = normalise_unit_key("default", v)
        assert result == "3a", f"Expected '3a' for '{v}', got '{result}'"


def test_default_scheme_strips_leading_zero():
    result = normalise_unit_key("default", "07")
    assert result == "7"


def test_mixed_use_keeps_descriptor():
    result = normalise_unit_key("mixed_use", "Flat 3A")
    assert result == "flat3a"


def test_verbatim_collapses_whitespace():
    result = normalise_unit_key("verbatim", "Flat   3A")
    assert result == "flat 3a"


def test_empty_label_raises():
    with pytest.raises(UnitNormalisationError):
        normalise_unit_key("default", "")
    with pytest.raises(UnitNormalisationError):
        normalise_unit_key("mixed_use", "")
    with pytest.raises(UnitNormalisationError):
        normalise_unit_key("verbatim", "")