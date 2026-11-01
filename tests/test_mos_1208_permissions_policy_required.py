import ingress_security as sec
import permissions_policy as pp


def test_permissions_configured_requires_clipboard_and_unload():
    source = open("permissions_policy.py", encoding="utf-8").read()
    assert "clipboard-read=()" in source
    assert "clipboard-write=()" in source
    assert "unload=()" in source
    assert pp.permissions_configured() is True


def test_permissions_configured_false_without_clipboard(monkeypatch):
    values = {name.decode().casefold(): value.decode() for name, value in sec.SECURITY_HEADERS}
    policy = values["permissions-policy"].replace("clipboard-read=(), ", "").replace("clipboard-write=(), ", "")
    patched = tuple(
        (name, policy.encode() if name.decode().casefold() == "permissions-policy" else value)
        for name, value in sec.SECURITY_HEADERS
    )
    monkeypatch.setattr(sec, "SECURITY_HEADERS", patched)
    assert pp.permissions_configured() is False
