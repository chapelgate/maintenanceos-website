from __future__ import annotations

import inspect
from types import SimpleNamespace

import pytest

import landlord_context_adapter as adapter


def _synthetic_client(**overrides):
    row = {"id": 1, "name": "Synthetic Portfolio Client"}
    row.update(overrides)
    return row


def _synthetic_property(**overrides):
    row = {
        "id": 10,
        "client_id": 1,
        "address": "1 Synthetic Pilot Way",
        "postcode": "SW1A 1AA",
        "property_type": "flat",
    }
    row.update(overrides)
    return row


def _synthetic_resident(**overrides):
    row = {
        "id": 100,
        "client_id": 1,
        "property_id": 10,
        "name": "Synthetic Occupant",
        "phone": "+447700900123",
        "email": "synthetic-occupant@example.invalid",
        "active": True,
    }
    row.update(overrides)
    return row


def _orm_client(**overrides):
    return SimpleNamespace(id=1, name="ORM Client", **overrides)


def _orm_property(**overrides):
    base = {"id": 10, "client_id": 1, "address": "1 ORM Way",
            "postcode": "SW1A 1AA", "property_type": "flat"}
    base.update(overrides)
    return SimpleNamespace(**base)


def _orm_resident(**overrides):
    base = {"id": 100, "client_id": 1, "property_id": 10,
            "name": "ORM Occupant", "phone": "+447700900123",
            "email": "orm@example.invalid", "active": True}
    base.update(overrides)
    return SimpleNamespace(**base)


def test_builds_context_from_synthetic_rows(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")

    client = _synthetic_client()
    properties = [
        _synthetic_property(id=1, postcode="SW1A 1AA", address="1 Synthetic Way"),
        _synthetic_property(id=2, postcode="SY14 7AA", address="2 Synthetic Close"),
    ]
    residents = [
        _synthetic_resident(id=1, property_id=1, name="Occupant One"),
        _synthetic_resident(id=2, property_id=2, name="Occupant Two", active=False),
    ]

    context = adapter.build_landlord_context(client, properties, residents)

    assert context["portfolio"]["id"] == 1
    assert context["portfolio"]["name"] == "Synthetic Portfolio Client"
    assert len(context["properties"]) == 2
    assert context["properties"][0]["postcode"] == "SW1A 1AA"
    assert context["properties"][1]["address"] == "2 Synthetic Close"
    assert len(context["tenancies"]) == 2
    assert context["tenancies"][0]["occupant_name"] == "Occupant One"
    assert context["tenancies"][1]["active"] is False
    assert context["property_count"] == 2


def test_builds_context_from_orm_rows(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")

    client = _orm_client()
    properties = [
        _orm_property(id=1, postcode="M1 1AA", address="1 ORM Way"),
        _orm_property(id=2, postcode="E1 6AN", address="2 ORM Close"),
    ]
    residents = [
        _orm_resident(id=1, property_id=1, name="ORM Occupant One"),
        _orm_resident(id=2, property_id=2, name="ORM Occupant Two", active=False),
    ]

    context = adapter.build_landlord_context(client, properties, residents)

    assert context["portfolio"]["id"] == 1
    assert len(context["properties"]) == 2
    assert context["properties"][0]["postcode"] == "M1 1AA"
    assert len(context["tenancies"]) == 2
    assert context["tenancies"][0]["occupant_name"] == "ORM Occupant One"
    assert context["tenancies"][1]["active"] is False
    assert context["property_count"] == 2


def test_rejects_non_england_postcode_for_pilot(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")

    client = _synthetic_client()
    properties = [_synthetic_property(postcode="BT1 5GS")]
    residents = [_synthetic_resident()]

    with pytest.raises(adapter.LandlordContextError):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_malformed_postcodes(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")

    client = _synthetic_client()
    for bad in ["ZZ1 1ZZ", "X", "NOTAPOSTCODE", "", "   ", "SW1A", "123 456"]:
        properties = [_synthetic_property(postcode=bad)]
        with pytest.raises(adapter.LandlordContextError):
            adapter.build_landlord_context(client, properties, [_synthetic_resident()])


def test_rejects_non_england_nations_and_territories(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")

    client = _synthetic_client()
    boundaries = [
        ("AB10 1AB", "Scotland"),
        ("EH1 1YZ", "Scotland"),
        ("G1 1AA", "Scotland"),
        ("CF10 1AA", "Wales"),
        ("LL55 1YZ", "Wales"),
        ("SA1 1AA", "Wales"),
        ("BT1 1GS", "Northern Ireland"),
        ("GY1 1AA", "Guernsey"),
        ("JE2 3AA", "Jersey"),
        ("IM1 1AA", "Isle of Man"),
        ("ZZ1 1ZZ", "Unknown area"),
    ]
    for postcode, _nation in boundaries:
        properties = [_synthetic_property(postcode=postcode)]
        with pytest.raises(adapter.LandlordContextError):
            adapter.build_landlord_context(client, properties, [_synthetic_resident()])


def test_rejects_welsh_unit_in_mixed_postcode_area(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")

    with pytest.raises(adapter.LandlordContextError):
        adapter.build_landlord_context(
            _synthetic_client(),
            [_synthetic_property(postcode="CH4 5AB")],
            [_synthetic_resident()],
        )


def test_accepts_valid_england_postcodes(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")

    client = _synthetic_client()
    valid = [
        "SW1A 1AA",
        "M1 1AA",
        "B1 1AA",
        "LS1 1AA",
        "E1 6AN",
        "SY14 7AA",
    ]
    for postcode in valid:
        properties = [_synthetic_property(postcode=postcode)]
        context = adapter.build_landlord_context(client, properties, [_synthetic_resident()])
        assert context["properties"][0]["postcode"] == postcode


def test_no_schema_migration_required():
    source = inspect.getsource(adapter)
    assert "migrate_schema" not in source
    assert "alembic" not in source.lower()
    assert "Base.metadata" not in source
    assert "create_all" not in source
    mod_imports = [
        line.strip()
        for line in source.splitlines()
        if line.strip().startswith(("import ", "from "))
    ]
    for line in mod_imports:
        assert "migrate_schema" not in line
        assert "models" not in line.split()


def test_wallasey_ch45_accepted(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")

    client = _orm_client()
    properties = [
        _orm_property(
            id=21,
            client_id=1,
            address="21 Smith Street, Wallasey",
            postcode="CH45 2AB",
            property_type="terraced house",
        )
    ]
    residents = [_orm_resident(id=100, property_id=21, name="Wallasey Occupant")]

    assert adapter.is_england_pilot_postcode("CH45 2AB") is True
    context = adapter.build_landlord_context(client, properties, residents)
    assert context["property_count"] == 1
    assert context["properties"][0]["address"] == "21 Smith Street, Wallasey"
    assert context["properties"][0]["postcode"] == "CH45 2AB"


def test_welsh_ch4_rejected(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")

    assert adapter.is_england_pilot_postcode("CH4 5AB") is False
    client = _synthetic_client()
    properties = [_synthetic_property(postcode="CH4 5AB")]
    with pytest.raises(adapter.LandlordContextError):
        adapter.build_landlord_context(client, properties, [_synthetic_resident()])


def test_rejects_cross_client_property(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")

    client = _synthetic_client(id=1)
    properties = [_synthetic_property(id=10, client_id=2, postcode="SW1A 1AA")]
    residents = [_synthetic_resident()]

    with pytest.raises(adapter.LandlordContextError, match="client"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_cross_client_resident(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")

    client = _synthetic_client(id=1)
    properties = [_synthetic_property(id=10, client_id=1, postcode="SW1A 1AA")]
    residents = [_synthetic_resident(client_id=2)]

    with pytest.raises(adapter.LandlordContextError, match="client"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_orphan_resident(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")

    client = _synthetic_client(id=1)
    properties = [_synthetic_property(id=10, client_id=1, postcode="SW1A 1AA")]
    residents = [_synthetic_resident(property_id=999)]

    with pytest.raises(adapter.LandlordContextError, match="property"):
        adapter.build_landlord_context(client, properties, residents)


def _cap_properties(count, start=1):
    return [
        _synthetic_property(
            id=i,
            client_id=1,
            postcode=f"SW1A 1{chr(65 + (i - start))}A",
        )
        for i in range(start, start + count)
    ]


def test_enforces_property_cap_at_10(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")

    client = _synthetic_client()
    properties = _cap_properties(10)
    context = adapter.build_landlord_context(client, properties, [])
    assert context["property_count"] == 10


def test_rejects_eleventh_property(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")

    client = _synthetic_client()
    properties = _cap_properties(11)
    with pytest.raises(adapter.LandlordContextError, match="cap"):
        adapter.build_landlord_context(client, properties, [])


def test_cap_applies_without_product_profile(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    monkeypatch.delenv("PRODUCT_PROFILE", raising=False)

    client = _synthetic_client()
    properties = _cap_properties(10)
    context = adapter.build_landlord_context(client, properties, [])
    assert context["property_count"] == 10

    properties = properties + [
        _synthetic_property(id=11, client_id=1, postcode="SW2 1AA")
    ]
    with pytest.raises(adapter.LandlordContextError, match="cap"):
        adapter.build_landlord_context(client, properties, [])


def test_cap_not_enforced_outside_landlord_vertical(monkeypatch):
    monkeypatch.delenv("WORKSMART_VERTICAL", raising=False)

    client = _synthetic_client()
    properties = _cap_properties(14, start=1)
    context = adapter.build_landlord_context(client, properties, [])
    assert context["property_count"] == 14


MIXED_BORDER_ENGLAND = [
    ("CH1 1AA", "supported England CH unit"),
    ("CH2 3AB", "supported England CH unit"),
    ("CH3 5AN", "supported England CH unit"),
    ("CH41 9AN", "supported England Wirral CH unit"),
    ("SY1 1AA", "supported England SY unit"),
    ("SY2 6AA", "supported England SY unit"),
    ("SY3 7AA", "supported England SY unit"),
    ("SY14 7AA", "supported England SY14 unit"),
]

MIXED_BORDER_WELSH = [
    ("CH4 5AB", "Welsh CH4 unit"),
    ("CH5 1AA", "Welsh CH5 unit"),
    ("CH6 5AA", "Welsh CH6 unit"),
    ("CH7 1AA", "Welsh CH7 unit"),
    ("CH8 7AA", "Welsh CH8 unit"),
    ("SY15 1AA", "Welsh SY15 unit"),
    ("SY16 1AA", "Welsh SY16 unit"),
    ("SY20 1AA", "Welsh SY20 unit"),
    ("SY23 1DE", "Welsh SY23 unit"),
    ("SY25 6AA", "Welsh SY25 unit"),
]

UNRESOLVED_MIXED_BORDER = [
    ("CH4 1AA", "mixed CH4 unit not in supported England set"),
    ("CH4 9AA", "mixed CH4 unit not in supported England set"),
]


@pytest.mark.parametrize("postcode,desc", MIXED_BORDER_ENGLAND)
def test_accepts_england_units_in_mixed_ch_sy_areas(monkeypatch, postcode, desc):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _synthetic_client()
    properties = [_synthetic_property(postcode=postcode)]
    context = adapter.build_landlord_context(client, properties, [_synthetic_resident()])
    assert context["properties"][0]["postcode"] == postcode, desc


@pytest.mark.parametrize("postcode,desc", MIXED_BORDER_WELSH)
def test_rejects_welsh_units_in_mixed_ch_sy_areas(monkeypatch, postcode, desc):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _synthetic_client()
    properties = [_synthetic_property(postcode=postcode)]
    with pytest.raises(adapter.LandlordContextError):
        adapter.build_landlord_context(client, properties, [_synthetic_resident()])


@pytest.mark.parametrize("postcode,desc", UNRESOLVED_MIXED_BORDER)
def test_rejects_unresolved_mixed_border_units_fail_closed(monkeypatch, postcode, desc):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _synthetic_client()
    properties = [_synthetic_property(postcode=postcode)]
    with pytest.raises(adapter.LandlordContextError):
        adapter.build_landlord_context(client, properties, [_synthetic_resident()])


MIXED_BORDER_ACCEPT = [
    ("CH45 2AB", "Wallasey CH45 England district"),
    ("CH45 9JX", "Wallasey CH45 England district second unit"),
    ("CH1 1AB", "CH1 England district"),
    ("CH2 1AA", "CH2 England district"),
    ("CH41 1AA", "CH41 England district"),
    ("CH64 1AA", "CH64 England district"),
    ("SY8 1AA", "SY8 England district"),
    ("SY14 7AA", "SY14 England district"),
    ("SY14 8AA", "SY14 England district"),
    ("AL1 1AA", "AL England area"),
    ("SW1A 1AA", "SW England area"),
]


@pytest.mark.parametrize("postcode,desc", MIXED_BORDER_ACCEPT)
def test_accepts_district_level_england_ch_sy_units(monkeypatch, postcode, desc):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _synthetic_client()
    properties = [_synthetic_property(postcode=postcode)]
    context = adapter.build_landlord_context(client, properties, [_synthetic_resident()])
    assert context["properties"][0]["postcode"] == postcode, desc


MIXED_BORDER_REJECT = [
    ("CH4 5AB", "mixed CH4 unit"),
    ("CH5 1AA", "Welsh CH5 district"),
    ("CH8 7AA", "Welsh CH8 district"),
    ("SY15 1AA", "Welsh SY15 district"),
    ("SY23 1DE", "Welsh SY23 district"),
    ("BT1 5GS", "Northern Ireland"),
    ("ZZ1 1ZZ", "Unknown area"),
    ("TD15 1AA", "TD fail-closed"),
]


@pytest.mark.parametrize("postcode,desc", MIXED_BORDER_REJECT)
def test_rejects_district_level_non_england_units(monkeypatch, postcode, desc):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _synthetic_client()
    properties = [_synthetic_property(postcode=postcode)]
    with pytest.raises(adapter.LandlordContextError):
        adapter.build_landlord_context(client, properties, [_synthetic_resident()])


def test_rejects_malformed_postcode(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _synthetic_client()
    properties = [_synthetic_property(postcode="NOTAPOSTCODE")]
    with pytest.raises(adapter.LandlordContextError):
        adapter.build_landlord_context(client, properties, [_synthetic_resident()])


def test_builds_context_wallasey_orm_row(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")

    client = _orm_client()
    properties = [
        _orm_property(
            id=21,
            client_id=1,
            address="21 Smith Street, Wallasey",
            postcode="CH45 2AB",
            property_type="terraced house",
        )
    ]
    residents = [_orm_resident(id=100, property_id=21, name="Wallasey Occupant")]

    context = adapter.build_landlord_context(client, properties, residents)

    assert context["property_count"] == 1
    assert context["properties"][0]["id"] == 21
    assert context["properties"][0]["address"] == "21 Smith Street, Wallasey"
    assert context["properties"][0]["postcode"] == "CH45 2AB"
    assert context["tenancies"][0]["occupant_name"] == "Wallasey Occupant"


def test_rejects_missing_client_id_dict(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = {"name": "Client without id"}
    properties = [_synthetic_property()]
    residents = [_synthetic_resident()]
    with pytest.raises(adapter.LandlordContextError, match="Missing required client identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_null_client_id_dict(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = {"id": None, "name": "Client with null id"}
    properties = [_synthetic_property()]
    residents = [_synthetic_resident()]
    with pytest.raises(adapter.LandlordContextError, match="Missing required client identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_missing_client_id_orm(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = SimpleNamespace(name="ORM Client without id")
    properties = [_orm_property()]
    residents = [_orm_resident()]
    with pytest.raises(adapter.LandlordContextError, match="Missing required client identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_null_client_id_orm(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = SimpleNamespace(id=None, name="ORM Client with null id")
    properties = [_orm_property()]
    residents = [_orm_resident()]
    with pytest.raises(adapter.LandlordContextError, match="Missing required client identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_missing_property_id_dict(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _synthetic_client()
    properties = [{"client_id": 1, "postcode": "SW1A 1AA", "address": "Test", "property_type": "flat"}]
    residents = [_synthetic_resident()]
    with pytest.raises(adapter.LandlordContextError, match="Missing required property identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_null_property_id_dict(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _synthetic_client()
    properties = [{"id": None, "client_id": 1, "postcode": "SW1A 1AA", "address": "Test", "property_type": "flat"}]
    residents = [_synthetic_resident()]
    with pytest.raises(adapter.LandlordContextError, match="Missing required property identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_missing_property_client_id_dict(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _synthetic_client()
    properties = [{"id": 10, "postcode": "SW1A 1AA", "address": "Test", "property_type": "flat"}]
    residents = [_synthetic_resident()]
    with pytest.raises(adapter.LandlordContextError, match="Missing required property identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_null_property_client_id_dict(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _synthetic_client()
    properties = [{"id": 10, "client_id": None, "postcode": "SW1A 1AA", "address": "Test", "property_type": "flat"}]
    residents = [_synthetic_resident()]
    with pytest.raises(adapter.LandlordContextError, match="Missing required property identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_missing_property_id_orm(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _orm_client()
    properties = [SimpleNamespace(client_id=1, postcode="SW1A 1AA", address="Test", property_type="flat")]
    residents = [_orm_resident()]
    with pytest.raises(adapter.LandlordContextError, match="Missing required property identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_null_property_id_orm(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _orm_client()
    properties = [SimpleNamespace(id=None, client_id=1, postcode="SW1A 1AA", address="Test", property_type="flat")]
    residents = [_orm_resident()]
    with pytest.raises(adapter.LandlordContextError, match="Missing required property identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_missing_property_client_id_orm(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _orm_client()
    properties = [SimpleNamespace(id=10, postcode="SW1A 1AA", address="Test", property_type="flat")]
    residents = [_orm_resident()]
    with pytest.raises(adapter.LandlordContextError, match="Missing required property identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_null_property_client_id_orm(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _orm_client()
    properties = [SimpleNamespace(id=10, client_id=None, postcode="SW1A 1AA", address="Test", property_type="flat")]
    residents = [_orm_resident()]
    with pytest.raises(adapter.LandlordContextError, match="Missing required property identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_missing_resident_id_dict(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _synthetic_client()
    properties = [_synthetic_property()]
    residents = [{"client_id": 1, "property_id": 10, "name": "Resident without id"}]
    with pytest.raises(adapter.LandlordContextError, match="Missing required resident identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_null_resident_id_dict(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _synthetic_client()
    properties = [_synthetic_property()]
    residents = [{"id": None, "client_id": 1, "property_id": 10, "name": "Resident with null id"}]
    with pytest.raises(adapter.LandlordContextError, match="Missing required resident identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_missing_resident_client_id_dict(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _synthetic_client()
    properties = [_synthetic_property()]
    residents = [{"id": 100, "property_id": 10, "name": "Resident without client_id"}]
    with pytest.raises(adapter.LandlordContextError, match="Missing required resident identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_null_resident_client_id_dict(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _synthetic_client()
    properties = [_synthetic_property()]
    residents = [{"id": 100, "client_id": None, "property_id": 10, "name": "Resident with null client_id"}]
    with pytest.raises(adapter.LandlordContextError, match="Missing required resident identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_missing_resident_property_id_dict(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _synthetic_client()
    properties = [_synthetic_property()]
    residents = [{"id": 100, "client_id": 1, "name": "Resident without property_id"}]
    with pytest.raises(adapter.LandlordContextError, match="Missing required resident identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_null_resident_property_id_dict(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _synthetic_client()
    properties = [_synthetic_property()]
    residents = [{"id": 100, "client_id": 1, "property_id": None, "name": "Resident with null property_id"}]
    with pytest.raises(adapter.LandlordContextError, match="Missing required resident identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_missing_resident_id_orm(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _orm_client()
    properties = [_orm_property()]
    residents = [SimpleNamespace(client_id=1, property_id=10, name="Resident without id")]
    with pytest.raises(adapter.LandlordContextError, match="Missing required resident identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_null_resident_id_orm(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _orm_client()
    properties = [_orm_property()]
    residents = [SimpleNamespace(id=None, client_id=1, property_id=10, name="Resident with null id")]
    with pytest.raises(adapter.LandlordContextError, match="Missing required resident identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_missing_resident_client_id_orm(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _orm_client()
    properties = [_orm_property()]
    residents = [SimpleNamespace(id=100, property_id=10, name="Resident without client_id")]
    with pytest.raises(adapter.LandlordContextError, match="Missing required resident identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_null_resident_client_id_orm(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _orm_client()
    properties = [_orm_property()]
    residents = [SimpleNamespace(id=100, client_id=None, property_id=10, name="Resident with null client_id")]
    with pytest.raises(adapter.LandlordContextError, match="Missing required resident identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_missing_resident_property_id_orm(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _orm_client()
    properties = [_orm_property()]
    residents = [SimpleNamespace(id=100, client_id=1, name="Resident without property_id")]
    with pytest.raises(adapter.LandlordContextError, match="Missing required resident identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_rejects_null_resident_property_id_orm(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _orm_client()
    properties = [_orm_property()]
    residents = [SimpleNamespace(id=100, client_id=1, property_id=None, name="Resident with null property_id")]
    with pytest.raises(adapter.LandlordContextError, match="Missing required resident identifier"):
        adapter.build_landlord_context(client, properties, residents)


def test_zero_id_is_valid(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _synthetic_client(id=0)
    properties = [_synthetic_property(id=0, client_id=0, postcode="SW1A 1AA")]
    residents = [_synthetic_resident(id=0, client_id=0, property_id=0)]
    context = adapter.build_landlord_context(client, properties, residents)
    assert context["portfolio"]["id"] == 0
    assert context["properties"][0]["id"] == 0
    assert context["tenancies"][0]["id"] == 0


def test_null_ids_rejected_before_cap(monkeypatch):
    monkeypatch.setenv("WORKSMART_VERTICAL", "landlord")
    client = _synthetic_client()
    properties = _cap_properties(11)
    properties[0] = {
        "id": None,
        "client_id": 1,
        "address": "x",
        "postcode": "SW1A 1AA",
        "property_type": "flat",
    }
    with pytest.raises(adapter.LandlordContextError, match="Missing required property identifier"):
        adapter.build_landlord_context(client, properties, [])
