from pathlib import Path

import pytest


def test_container_configuration_has_no_default_database_password():
    compose = (Path(__file__).parents[1] / "docker-compose.yml").read_text(encoding="utf-8")
    assert "change-me" not in compose.casefold()
    assert "POSTGRES_PASSWORD:?" in compose

from security import app_secret_ready,hash_password,verify_password,sign_link,verify_link
def test_password_hash():
    h=hash_password("Example123!")
    assert verify_password("Example123!",h)
    assert not verify_password("Wrong",h)
def test_signed_portal_link(monkeypatch):
    monkeypatch.setenv("APP_SECRET","s"*32)
    t=sign_link("accept",10,3)
    assert verify_link("accept",10,3,t)
    assert not verify_link("decline",10,3,t)

def test_portal_links_fail_closed_with_weak_secret(monkeypatch):
    monkeypatch.setenv("APP_SECRET","change-me")
    assert not app_secret_ready()
    assert not verify_link("accept",10,3,"anything")
    with pytest.raises(RuntimeError):
        sign_link("accept",10,3)
