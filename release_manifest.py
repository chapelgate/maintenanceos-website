from __future__ import annotations

import re

import product_profile
from commercial_release_controls import (
    data_lifecycle_runtime_ready,
    external_identity_runtime_ready,
    retention_policy_configured,
    social_housing_runtime_ready,
)
from synthetic_buyer_onboarding_kit import (
    kit_doc_path,
    populate_demo_buyer_pack,
    required_step_fields,
)

_SHA = re.compile(r"[0-9a-fA-F]{40}")


def synthetic_buyer_pack_fields() -> dict:
    pack = populate_demo_buyer_pack()
    return {
        "buyer_pack_synthetic_only": True,
        "buyer_pack_sale_ready": False,
        "buyer_pack_live_pii": False,
        "buyer_pack_kit_present": bool(pack["kit_present"] and kit_doc_path().is_file()),
        "buyer_pack_required_step_fields": list(required_step_fields()),
        "buyer_pack_commercial_release_ready": False,
    }


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
