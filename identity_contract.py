"""Provider-neutral production identity and authorisation contract.

No password storage, token issuance, IdP implementation, or persistence lives here.
The caller supplies already-validated external identity and session facts.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import FrozenSet


def _has_control_chars(value: str) -> bool:
    return any(
        ord(ch) < 32
        or ord(ch) == 127
        or 0x80 <= ord(ch) <= 0x9F
        for ch in value
    )


@dataclass(frozen=True)
class ExternalPrincipal:
    issuer: str
    subject: str
    tenant_ids: FrozenSet[int]
    roles: FrozenSet[str]
    assurance: FrozenSet[str]
    active: bool = True
    revoked: bool = False


@dataclass(frozen=True)
class IdentitySession:
    session_id: str
    expires_at: datetime
    active: bool = True
    revoked: bool = False


@dataclass(frozen=True)
class AuthorizationRequirement:
    tenant_id: int
    allowed_roles: FrozenSet[str]
    required_assurance: FrozenSet[str] = frozenset()


@dataclass(frozen=True)
class AuthorizationDecision:
    allowed: bool
    reason: str
    audit_context: dict[str, object] | None = None


def _deny(reason: str) -> AuthorizationDecision:
    return AuthorizationDecision(False, reason, None)


def authorize_identity(
    principal: ExternalPrincipal | None,
    session: IdentitySession | None,
    requirement: AuthorizationRequirement,
    *,
    now: datetime,
) -> AuthorizationDecision:
    """Fail-closed authorization over externally validated identity facts."""
    if requirement.tenant_id <= 0:
        return _deny("tenant_required")
    if principal is None:
        return _deny("principal_required")
    if not principal.issuer.strip() or not principal.subject.strip():
        return _deny("principal_identity_invalid")
    if _has_control_chars(principal.issuer) or _has_control_chars(principal.subject):
        return _deny("principal_identity_control_chars")
    if any(_has_control_chars(role) for role in principal.roles):
        return _deny("principal_role_control_chars")
    if any(_has_control_chars(item) for item in principal.assurance):
        return _deny("principal_assurance_control_chars")
    if principal.revoked:
        return _deny("account_revoked")
    if not principal.active:
        return _deny("account_inactive")
    if session is None or not session.session_id.strip():
        return _deny("session_required")
    if _has_control_chars(session.session_id):
        return _deny("session_control_chars")
    if session.revoked:
        return _deny("session_revoked")
    if not session.active:
        return _deny("session_inactive")
    if session.expires_at <= now:
        return _deny("session_expired")
    if requirement.tenant_id not in principal.tenant_ids:
        return _deny("tenant_membership_required")
    if not requirement.allowed_roles:
        return _deny("role_policy_required")
    if any(_has_control_chars(role) for role in requirement.allowed_roles):
        return _deny("role_policy_control_chars")
    if any(_has_control_chars(item) for item in requirement.required_assurance):
        return _deny("assurance_policy_control_chars")
    effective_roles = principal.roles.intersection(requirement.allowed_roles)
    if not effective_roles:
        return _deny("role_not_authorized")
    if not requirement.required_assurance.issubset(principal.assurance):
        return _deny("assurance_insufficient")

    audit_context: dict[str, object] = {
        "issuer": principal.issuer,
        "subject": principal.subject,
        "tenant_id": requirement.tenant_id,
        "roles": tuple(sorted(effective_roles)),
        "assurance": tuple(sorted(principal.assurance)),
        "session_id": session.session_id,
    }
    return AuthorizationDecision(True, "authorized", audit_context)
