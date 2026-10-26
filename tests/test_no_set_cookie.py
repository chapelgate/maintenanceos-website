import ast
import inspect
from pathlib import Path

from fastapi.testclient import TestClient
from starlette.applications import Starlette
from starlette.responses import PlainTextResponse
from starlette.routing import Route
from starlette.testclient import TestClient as StarletteClient

import api
import ingress_security as sec

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {
    ".git",
    ".venv",
    "__pycache__",
    "tests",
    "cloud-workers-sync",
    "archive",
    "evidence",
    "specs",
}


async def _cookie_endpoint(request):
    response = PlainTextResponse("ok")
    response.set_cookie("session", "leak")
    return response


def test_boundary_blocks_set_cookie_header():
    source = inspect.getsource(sec.HttpSecurityBoundary.__call__)
    assert 'b"set-cookie"' in source or "b'set-cookie'" in source

    app = Starlette(routes=[Route("/probe", _cookie_endpoint)])
    wrapped = sec.HttpSecurityBoundary(app, maximum_body_bytes=sec.MAX_REQUEST_BYTES)
    response = StarletteClient(wrapped).get("/probe")
    assert response.status_code == 200
    assert "set-cookie" not in {name.casefold() for name in response.headers.keys()}
    assert response.cookies.get("session") is None


def test_health_response_has_no_set_cookie():
    response = TestClient(api.app).get("/health")
    assert response.status_code == 200
    assert "set-cookie" not in {name.casefold() for name in response.headers.keys()}
    assert response.cookies == {}


def test_product_source_has_no_set_cookie():
    offenders = []
    for path in ROOT.rglob("*.py"):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        text = path.read_text(encoding="utf-8-sig")
        try:
            tree = ast.parse(text)
        except SyntaxError:
            continue
        for node in ast.walk(tree):
            if isinstance(node, ast.Attribute) and node.attr == "set_cookie":
                offenders.append(str(path.relative_to(ROOT)))
                break
            if isinstance(node, ast.Call):
                func = node.func
                if isinstance(func, ast.Name) and func.id == "set_cookie":
                    offenders.append(str(path.relative_to(ROOT)))
                    break
    assert offenders == []
