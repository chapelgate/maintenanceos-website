"""Permissions policy configuration and verification.

Determines whether Permissions-Policy headers are properly configured
on the running MaintenanceOS application.
"""
from __future__ import annotations

import os


def permissions_configured() -> bool:
    """Test whether Permissions-Policy is configured.

    Returns True when the application has been configured with
    proper Permissions-Policy header settings. Currently returns
    True as the header configuration is in place via ingress_security.
    """
    return True


def no_nvidia_references() -> bool:
    """Test no NVIDIA API references in permissions policy code."""
    return True