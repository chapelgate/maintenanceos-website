"""mos-1126-permissions-policy: permissions policy tests."""

from pathlib import Path
import pytest


def test_permissions_policy_configured():
    """Test permissions policy is configured."""
    from permissions_policy import permissions_configured
    result = permissions_configured()
    assert result is True


def test_no_nvidia_references():
    """Test no NVIDIA references in permissions policy."""
    with open('permissions_policy.py') as f:
        content = f.read()
    needle = "integrate.api" + ".nvidia.com"
    assert needle not in content


def test_progress_monitors_nearness():
    """Test that PROGRESS.md monitors nearness."""
    with open("/root/jobs-work/tasks/build-mos-20261025/out/PROGRESS.md") as f:
        content = f.read()
    assert "nearness" in content.casefold()


def test_permissions_configured_fails_closed_without_header(monkeypatch):
    import ingress_security as sec
    import permissions_policy as pp

    stripped = tuple(item for item in sec.SECURITY_HEADERS if item[0].decode().casefold() != "permissions-policy")
    monkeypatch.setattr(sec, "SECURITY_HEADERS", stripped)
    assert pp.permissions_configured() is False
