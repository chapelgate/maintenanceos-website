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
    assert 'integrate.api.nvidia.com' not in content


def test_progress_monitors_nearness():
    """Test that PROGRESS.md monitors nearness."""
    with open('/root/jobs-work/tasks/build-mos-20261025/out/PROGRESS.md') as f:
        content = f.read()
    assert 'Nearness' in content
