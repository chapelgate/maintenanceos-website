"""mos-1122-landlord-vertical: landlord vertical selector and e2e scorecard verification tests."""

from pathlib import Path
import pytest


def test_landlord_vertical_selector():
    """Test that landlord vertical selector is configured."""
    from landlord_vertical_selector import vertical_selector
    result = vertical_selector()
    assert result is not None


def test_landlord_e2e_scorecard():
    """Test landlord e2e scorecard verification."""
    from landlord_vertical_selector import e2e_scorecard
    result = e2e_scorecard()
    assert result is not None


def test_no_nvidia_references():
    """Test no NVIDIA references in landlord vertical."""
    with open("landlord_vertical_selector.py") as f:
        content = f.read()
    assert "integrate.api.nvidia.com" not in content


def test_progress_monitors_nearness():
    """Test that PROGRESS.md monitors nearness."""
    with open("/root/jobs-work/tasks/build-mos-20261025/out/PROGRESS.md") as f:
        content = f.read()
    assert "Nearness" in content
