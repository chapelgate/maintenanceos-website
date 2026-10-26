from __future__ import annotations

import os
import re
from typing import Any, Mapping

LANDLORD_PILOT_CAP = 10
LANDLORD_VERTICAL = "landlord"

_ENGLAND_AREAS = frozenset(
    {
        "AL",
        "B",
        "BA",
        "BB",
        "BD",
        "BH",
        "BL",
        "BN",
        "BR",
        "BS",
        "CA",
        "CB",
        "CM",
        "CO",
        "CR",
        "CT",
        "CV",
        "CW",
        "DA",
        "DE",
        "DH",
        "DL",
        "DN",
        "DT",
        "DY",
        "E",
        "EC",
        "EN",
        "EX",
        "FY",
        "GL",
        "GU",
        "HA",
        "HD",
        "HG",
        "HP",
        "HR",
        "HU",
        "HX",
        "IG",
        "IP",
        "KT",
        "L",
        "LA",
        "LE",
        "LN",
        "LS",
        "LU",
        "M",
        "ME",
        "MK",
        "N",
        "NE",
        "NG",
        "NN",
        "NR",
        "NW",
        "OL",
        "OX",
        "PE",
        "PL",
        "PO",
        "PR",
        "RG",
        "RH",
        "RM",
        "S",
        "SE",
        "SG",
        "SK",
        "SL",
        "SM",
        "SN",
        "SO",
        "SP",
        "SR",
        "SS",
        "ST",
        "SW",
        "TA",
        "TF",
        "TN",
        "TQ",
        "TR",
        "TS",
        "TW",
        "UB",
        "W",
        "WA",
        "WC",
        "WD",
        "WF",
        "WN",
        "WR",
        "WS",
        "WV",
        "YO",
    }
)

_ENGLAND_CH_DISTRICTS = frozenset(
    {
        "CH1",
        "CH2",
        "CH3",
        "CH41",
        "CH42",
        "CH43",
        "CH44",
        "CH45",
        "CH46",
        "CH47",
        "CH48",
        "CH49",
        "CH60",
        "CH61",
        "CH62",
        "CH63",
        "CH64",
        "CH65",
        "CH66",
    }
)

_ENGLAND_SY_DISTRICTS = frozenset(
    {
        "SY1",
        "SY2",
        "SY3",
        "SY4",
        "SY6",
        "SY7",
        "SY8",
        "SY9",
        "SY11",
        "SY12",
        "SY13",
        "SY14",
    }
)

_POSTCODE_RE = re.compile(r"^(GIR 0AA|[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2})$")


class LandlordContextError(ValueError):
    pass


def _env(key: str, default: str = "") -> str:
    return os.getenv(key, default).strip().lower()


def is_landlord_vertical() -> bool:
    return _env("WORKSMART_VERTICAL") == LANDLORD_VERTICAL


def _field(row: Any, name: str, default: Any = None) -> Any:
    if isinstance(row, Mapping):
        return row.get(name, default)
    return getattr(row, name, default)


def _require_id(row: Any, name: str, context: str) -> Any:
    val = _field(row, name)
    if val is None:
        raise LandlordContextError(f"Missing required {context} identifier: {name}")
    return val


def _normalise_postcode(value: str) -> str:
    return " ".join((value or "").upper().split())


def _postcode_area(value: str) -> str:
    normalised = _normalise_postcode(value)
    i = 0
    while i < len(normalised) and normalised[i].isalpha():
        i += 1
    return normalised[:i]


def _postcode_district(value: str) -> str:
    normalised = _normalise_postcode(value)
    i = 0
    while i < len(normalised) and normalised[i].isalpha():
        i += 1
    while i < len(normalised) and normalised[i].isdigit():
        i += 1
    return normalised[:i]


def _is_valid_uk_postcode_format(value: str) -> bool:
    normalised = _normalise_postcode(value)
    return bool(_POSTCODE_RE.match(normalised))


def is_england_pilot_postcode(value: str) -> bool:
    normalised = _normalise_postcode(value)
    if not _is_valid_uk_postcode_format(normalised):
        return False
    area = _postcode_area(normalised)
    if not area or area == "GIR":
        return False
    if area == "CH":
        return _postcode_district(normalised) in _ENGLAND_CH_DISTRICTS
    if area == "SY":
        return _postcode_district(normalised) in _ENGLAND_SY_DISTRICTS
    return area in _ENGLAND_AREAS


def _require_england_postcode(value: str) -> None:
    normalised = _normalise_postcode(value)
    if not normalised or not is_england_pilot_postcode(normalised):
        raise LandlordContextError(
            "Landlord pilot requires a valid England postcode"
        )


def _require_client_id(client: Any) -> Any:
    return _require_id(client, "id", "client")


def _require_property_identity(property_rows: list[Any]) -> None:
    for prop in property_rows:
        _require_id(prop, "id", "property")
        _require_id(prop, "client_id", "property")


def _require_resident_identity(resident_rows: list[Any]) -> None:
    for resident in resident_rows:
        _require_id(resident, "id", "resident")
        _require_id(resident, "client_id", "resident")
        _require_id(resident, "property_id", "resident")


def build_landlord_context(
    client: Any,
    properties: list[Any] | tuple[Any, ...] | None,
    residents: list[Any] | tuple[Any, ...] | None = None,
) -> dict[str, Any]:
    property_rows = list(properties or [])
    resident_rows = list(residents or [])

    client_id = _require_client_id(client)
    _require_property_identity(property_rows)
    _require_resident_identity(resident_rows)

    if is_landlord_vertical() and len(property_rows) > LANDLORD_PILOT_CAP:
        raise LandlordContextError(
            f"Landlord pilot property cap is {LANDLORD_PILOT_CAP}; got {len(property_rows)}"
        )

    property_ids = set()
    for prop in property_rows:
        if _field(prop, "client_id") != client_id:
            raise LandlordContextError(
                "Property does not belong to the client portfolio"
            )
        _require_england_postcode(_field(prop, "postcode") or "")
        property_ids.add(_field(prop, "id"))

    portfolio = {
        "id": client_id,
        "name": _field(client, "name", ""),
    }

    mapped_properties = []
    for prop in property_rows:
        raw_postcode = _field(prop, "postcode", "") or ""
        mapped_properties.append(
            {
                "id": _field(prop, "id"),
                "portfolio_id": _field(prop, "client_id"),
                "address": _field(prop, "address", ""),
                "postcode": raw_postcode,
                "property_type": _field(prop, "property_type", ""),
            }
        )

    for resident in resident_rows:
        if _field(resident, "client_id") != client_id:
            raise LandlordContextError(
                "Resident does not belong to the client portfolio"
            )
        if _field(resident, "property_id") not in property_ids:
            raise LandlordContextError(
                "Resident references a property not in the context"
            )

    mapped_tenancies = []
    for resident in resident_rows:
        mapped_tenancies.append(
            {
                "id": _field(resident, "id"),
                "portfolio_id": _field(resident, "client_id"),
                "property_id": _field(resident, "property_id"),
                "occupant_name": _field(resident, "name", ""),
                "phone": _field(resident, "phone", ""),
                "email": _field(resident, "email", ""),
                "active": bool(_field(resident, "active", True)),
            }
        )

    return {
        "portfolio": portfolio,
        "properties": mapped_properties,
        "tenancies": mapped_tenancies,
        "property_count": len(mapped_properties),
    }
