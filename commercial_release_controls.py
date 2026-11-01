"""Fail-closed commercial-release configuration gates.

These checks deliberately distinguish configured policy from implemented runtime
authority. The pure CR-10/11/12 cores are not, by themselves, production
integrations.
"""
from __future__ import annotations

import json
import os
from datetime import timedelta

from data_lifecycle import LifecyclePolicy, LifecyclePolicyError


REQUIRED_RETENTION_CLASSES = (
    "work_order_closed",
    "call_transcript",
    "communication_body",
    "unmatched_inbound",
    "contractor_profile",
    "user_account",
    "audit_minimal",
    "backup_copy",
)

_REQUIRED_RETENTION_CLASS_SET = frozenset(REQUIRED_RETENTION_CLASSES)


def retention_class_known(data_class: str) -> bool:
    value = (data_class or "").strip()
    if not value or any(ord(ch) < 32 for ch in value):
        return False
    return value in _REQUIRED_RETENTION_CLASS_SET


_EXTERNAL_IDENTITY_MODES = {"oidc", "saml"}
_EXTERNAL_IDENTITY_FIELDS = (
    "EXTERNAL_IDENTITY_ISSUER",
    "EXTERNAL_IDENTITY_AUDIENCE",
    "EXTERNAL_IDENTITY_TENANT_CLAIM",
    "EXTERNAL_IDENTITY_ROLE_CLAIM",
    "EXTERNAL_IDENTITY_ASSURANCE_CLAIM",
)


def retention_policy() -> LifecyclePolicy | None:
    """Return the configured policy or None.

    Durations are supplied by approved runtime configuration only. This module
    contains no default retention periods.
    """
    raw = os.getenv("DATA_RETENTION_POLICY_JSON", "").strip()
    if not raw:
        return None
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return None
    if not isinstance(parsed, dict) or set(parsed) != set(REQUIRED_RETENTION_CLASSES):
        return None

    values: dict[str, timedelta] = {}
    for data_class in REQUIRED_RETENTION_CLASSES:
        days = parsed.get(data_class)
        if type(days) is not int or days <= 0:
            return None
        values[data_class] = timedelta(days=days)

    try:
        policy = LifecyclePolicy(retention=values)
        for data_class in REQUIRED_RETENTION_CLASSES:
            policy.duration_for(data_class)
        return policy
    except LifecyclePolicyError:
        return None


def retention_policy_configured() -> bool:
    return retention_policy() is not None


def external_identity_configured() -> bool:
    mode = os.getenv("EXTERNAL_IDENTITY_MODE", "").strip().lower()
    if mode not in _EXTERNAL_IDENTITY_MODES:
        return False
    return all(bool(os.getenv(name, "").strip()) for name in _EXTERNAL_IDENTITY_FIELDS)


def data_lifecycle_runtime_ready() -> bool:
    """Fail closed until lifecycle persistence/execution is integrated.

    CR-11 is a side-effect-free decision core only; it does not delete,
    anonymise, export, hold, schedule, or mutate production records.
    """
    return False


def external_identity_runtime_ready() -> bool:
    """Fail closed until a production IdP adapter validates live identities.

    CR-12 consumes already-validated identity facts; it does not authenticate
    users, validate OIDC/SAML tokens, or manage sessions.
    """
    return False


def social_housing_runtime_ready() -> bool:
    """Require an explicit launch market and fail closed for social housing.

    The accepted Awaab policy is currently an isolated policy core, not a live
    persisted statutory-clock workflow.
    """
    scope = os.getenv("COMMERCIAL_MARKET_SCOPE", "").strip().lower()
    if scope == "uk-non-social-housing":
        return True
    if scope == "england-social-housing":
        return False
    return False
