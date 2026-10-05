from datetime import datetime, timedelta

from identity_contract import (
    AuthorizationRequirement,
    ExternalPrincipal,
    IdentitySession,
    authorize_identity,
)


NOW = datetime(2030, 1, 1, 12, 0, 0)


def principal(**changes):
    values = dict(
        issuer="https://idp.example",
        subject="user-123",
        tenant_ids=frozenset({1}),
        roles=frozenset({"manager"}),
        assurance=frozenset({"mfa"}),
        active=True,
        revoked=False,
    )
    values.update(changes)
    return ExternalPrincipal(**values)


def session(**changes):
    values = dict(
        session_id="session-1",
        expires_at=NOW + timedelta(minutes=15),
        active=True,
        revoked=False,
    )
    values.update(changes)
    return IdentitySession(**values)


def requirement(**changes):
    values = dict(
        tenant_id=1,
        allowed_roles=frozenset({"manager", "admin"}),
        required_assurance=frozenset({"mfa"}),
    )
    values.update(changes)
    return AuthorizationRequirement(**values)


def test_success_returns_deterministic_audit_context():
    decision = authorize_identity(principal(), session(), requirement(), now=NOW)
    assert decision.allowed is True
    assert decision.reason == "authorized"
    assert decision.audit_context == {
        "issuer": "https://idp.example",
        "subject": "user-123",
        "tenant_id": 1,
        "roles": ("manager",),
        "assurance": ("mfa",),
        "session_id": "session-1",
    }


def test_missing_or_cross_tenant_context_fails_closed():
    assert authorize_identity(principal(), session(), requirement(tenant_id=0), now=NOW).reason == "tenant_required"
    assert authorize_identity(principal(tenant_ids=frozenset({2})), session(), requirement(), now=NOW).reason == "tenant_membership_required"


def test_disabled_or_revoked_account_fails_closed():
    assert authorize_identity(principal(active=False), session(), requirement(), now=NOW).reason == "account_inactive"
    assert authorize_identity(principal(revoked=True), session(), requirement(), now=NOW).reason == "account_revoked"


def test_disabled_revoked_or_expired_session_fails_closed():
    assert authorize_identity(principal(), session(active=False), requirement(), now=NOW).reason == "session_inactive"
    assert authorize_identity(principal(), session(revoked=True), requirement(), now=NOW).reason == "session_revoked"
    assert authorize_identity(
        principal(), session(expires_at=NOW), requirement(), now=NOW
    ).reason == "session_expired"


def test_role_is_least_privilege_and_deny_by_default():
    denied = authorize_identity(
        principal(roles=frozenset({"viewer"})), session(), requirement(), now=NOW
    )
    assert (denied.allowed, denied.reason) == (False, "role_not_authorized")
    assert authorize_identity(
        principal(), session(), requirement(allowed_roles=frozenset()), now=NOW
    ).reason == "role_policy_required"


def test_mfa_or_other_required_assurance_must_be_present():
    assert authorize_identity(
        principal(assurance=frozenset()), session(), requirement(), now=NOW
    ).reason == "assurance_insufficient"
    strong = authorize_identity(
        principal(assurance=frozenset({"mfa", "hardware"})),
        session(),
        requirement(required_assurance=frozenset({"mfa", "hardware"})),
        now=NOW,
    )
    assert strong.allowed is True


def test_missing_external_identity_or_session_fails_closed():
    assert authorize_identity(None, session(), requirement(), now=NOW).reason == "principal_required"
    assert authorize_identity(principal(subject=""), session(), requirement(), now=NOW).reason == "principal_identity_invalid"
    assert authorize_identity(principal(), None, requirement(), now=NOW).reason == "session_required"
