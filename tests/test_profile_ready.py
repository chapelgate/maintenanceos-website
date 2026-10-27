import inspect

import pytest

import readiness


def test_product_profile_ready_is_callable():
    assert callable(readiness.profile_ready)


def test_profile_ready_in_checks():
    assert "product_profile_ready" in readiness.CHECKS
    assert readiness.CHECKS["product_profile_ready"]() is True
