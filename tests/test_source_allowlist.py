import inspect

import api


def test_work_order_sources_known_set():
    assert api.WORK_ORDER_SOURCES == frozenset(
        {
            "API",
            "MANUAL",
            "VOICE",
            "SMS",
            "EMAIL",
            "WHATSAPP",
            "TEST",
            "HARNESS",
            "LOCAL_ACCEPTANCE",
        }
    )
    source = inspect.getsource(api.create_work_order)
    assert "WORK_ORDER_SOURCES" in source
    assert "source is not allowed" in source


def test_work_order_source_accepts_allowlisted():
    assert "API" in api.WORK_ORDER_SOURCES
    assert "SMS" in api.WORK_ORDER_SOURCES
    assert "WHATSAPP" in api.WORK_ORDER_SOURCES
    assert api._bounded_text("API", "source", required=True, maximum=30) == "API"


def test_work_order_source_rejects_unknown():
    assert "NOT_A_CHANNEL" not in api.WORK_ORDER_SOURCES
    assert "" not in api.WORK_ORDER_SOURCES
    assert "api" not in api.WORK_ORDER_SOURCES
