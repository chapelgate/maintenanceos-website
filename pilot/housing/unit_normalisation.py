"""Unit normalisation for housing maintenance units.

Adapted from Pango (https://github.com/vul-os/pango), commit ba1e085.
Original: backend/internal/domain/ (unit normalisation) and maintenance job management.
Licence: MIT OR Apache-2.0 (commercially compatible; reuse with attribution).
Chapelgate implementation is a clean-room Python functional reimplementation:
no copied code, schemas, identifiers, strings, test data or text.
"""


import re


# Descriptor words to drop in DEFAULT scheme (and keep in MIXED_USE)
DEFAULT_DESCRIPTORS = {
    "flat", "apt", "unit", "door", "no", "number", "shop", "office",
    "house", "garage", "bay",
}

MIXED_USE_DESCRIPTORS = {
    "flat", "apt", "unit", "door", "no", "number", "shop", "office",
    "house", "garage", "bay",
}

VERBATIM_SCHEME = "verbatim"
DEFAULT_SCHEME = "default"
MIXED_USE_SCHEME = "mixed_use"


class UnitNormalisationError(ValueError):
    """Raised when a unit key cannot be normalised (e.g. empty label)."""


def _split_alnum(label: str) -> list:
    """Split label into alphanumeric tokens, dropping separators."""
    return [t for t in re.split(r"[^a-zA-Z0-9]+", label) if t]


def _strip_descriptors(tokens: list) -> str:
    """Drop leading descriptor tokens and join the rest."""
    i = 0
    while i < len(tokens) and tokens[i].lower() in DEFAULT_DESCRIPTORS:
        i += 1
    return "".join(tokens[i:]).lower()


def _strip_leading_zeros(key: str) -> str:
    """Strip leading zeros from a digit-start key, but keep at least one digit."""
    if not key:
        return key
    stripped = key.lstrip("0")
    return stripped if stripped else "0"


def normalise_unit_key(scheme: str, label: str) -> str:
    """Normalise a unit/door label into a stable key.

    Args:
        scheme: One of "default", "mixed_use", or "verbatim".
        label: The unit label string.

    Returns:
        A normalised stable key string.

    Raises:
        UnitNormalisationError: If the label is empty.
    """
    if not label or not label.strip():
        raise UnitNormalisationError("empty label cannot be normalised")

    label = label.strip()

    if scheme == VERBATIM_SCHEME:
        return " ".join(label.lower().split())

    # DEFAULT or MIXED_USE
    tokens = _split_alnum(label)

    if scheme == DEFAULT_SCHEME:
        result = _strip_descriptors(tokens)
        return _strip_leading_zeros(result)
    elif scheme == MIXED_USE_SCHEME:
        return "".join(t.lower() for t in tokens)
    else:
        raise UnitNormalisationError(f"unknown scheme: {scheme}")


# Convenience aliases for common schemes
def normalise_default(label: str) -> str:
    return normalise_unit_key(DEFAULT_SCHEME, label)


def normalise_mixed_use(label: str) -> str:
    return normalise_unit_key(MIXED_USE_SCHEME, label)


def normalise_verbatim(label: str) -> str:
    return normalise_unit_key(VERBATIM_SCHEME, label)


# UNIT_SCHEME mapping and exports
UNIT_SCHEME = {
    "default": DEFAULT_SCHEME,
    "mixed_use": MIXED_USE_SCHEME,
    "verbatim": VERBATIM_SCHEME,
}

UNIT_ATTRIBUTES = {
    "default": {
        "strip_descriptors": True,
        "strip_leading_zeros": True,
        "collapse_whitespace": True,
    },
    "mixed_use": {
        "strip_descriptors": False,
        "strip_leading_zeros": True,
        "collapse_whitespace": True,
    },
    "verbatim": {
        "strip_descriptors": False,
        "strip_leading_zeros": False,
        "collapse_whitespace": True,
    },
}

__all__ = [
    "UnitNormalisationError",
    "normalise_unit_key",
    "normalise_default",
    "normalise_mixed_use",
    "normalise_verbatim",
    "UNIT_SCHEME",
    "UNIT_ATTRIBUTES",
]