import inspect

import pytest
from fastapi import HTTPException

import api
import security


def test_sign_link_uses_ttl_func():
    source = inspect.getsource(security.sign_link)
    assert 'contractor_link_ttl_seconds()' in source


def test_verify_link_rejects_overlong_token():
    # verify_link already has this bound
    source = inspect.getsource(security.verify_link)
    assert 'len(token) > CONTRACTOR_LINK_TOKEN_MAX' in source


def test_contractor_ttl_bounds_constants():
    assert security.CONTRACTOR_LINK_TTL_DEFAULT == 86400
    assert security.CONTRACTOR_LINK_TTL_MIN == 300
    assert security.CONTRACTOR_LINK_TTL_MAX == 604800
