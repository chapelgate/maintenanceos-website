from __future__ import annotations

import re

import product_profile
from commercial_release_controls import (
    data_lifecycle_runtime_ready,
    external_identity_runtime_ready,
    retention_policy_configured,
    social_housing_runtime_ready,
)

_SHA = re.compile(r"[0-9a-fA-F]{40}")


def manifest(sha: str) -> dict:
    if not isinstance(sha, str) or _SHA.fullmatch(sha) is None:
        raise ValueError("sha must be 40 hex characters")
    ready = product_profile.profile_ready()
    selected = product_profile.profile() if ready else ""
    return {
        "data_lifecycle_runtime_ready": data_lifecycle_runtime_ready(),
        "external_identity_runtime_ready": external_identity_runtime_ready(),
        "git_sha": sha,
        "product_profile": selected,
        "profile_ready": ready,
        "retention_policy_configured": retention_policy_configured(),
        "social_housing_runtime_ready": social_housing_runtime_ready(),
    }
