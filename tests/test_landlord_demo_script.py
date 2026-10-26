import os
import subprocess
import sys

import pytest


def test_demo_script_runs_synthetic_pilot():
    """Run the demo script end-to-end with synthetic fixtures."""
    env = dict(os.environ)
    env["WORKSMART_VERTICAL"] = "landlordos"
    result = subprocess.run(
        [sys.executable, "demo_landlord_pilot.py"],
        capture_output=True,
        text=True,
        env=env,
        cwd="/root/jobs-work/readiness-loop/mirrors/maintenanceos-v1-pilot",
    )
    assert result.returncode == 0, f"demo script failed:\n{result.stdout}\n{result.stderr}"
    assert "All checks passed" in result.stdout
    assert "Vertical active: True" in result.stdout
    assert "Property count: 5" in result.stdout
    assert "Passed: True" in result.stdout

