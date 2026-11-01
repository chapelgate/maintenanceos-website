from datetime import datetime, timedelta

from identity_contract import (
    AuthorizationRequirement,
    ExternalPrincipal,
    IdentitySession,
    authorize_identity,
)

NOW = datetime(2030, 1, 1, 12, 0, 0)


def _principal(**changes):
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


def _session(**changes):
    values = dict(
        session_id="session-1",
        expires_at=NOW + timedelta(minutes=15),
        active=True,
        revoked=False,
    )
    values.update(changes)
    return IdentitySession(**values)


def _requirement(**changes):
    values = dict(
        tenant_id=1,
        allowed_roles=frozenset({"manager", "admin"}),
        required_assurance=frozenset({"mfa"}),
    )
    values.update(changes)
    return AuthorizationRequirement(**values)


def test_reject_control_chars_in_issuer_subject():
    d = authorize_identity(_principal(issuer="https://idp.example\x00"), _session(), _requirement(), now=NOW)
    assert d.allowed is False
    assert d.reason == "principal_identity_control_chars"
    d = authorize_identity(_principal(subject="user\n123"), _session(), _requirement(), now=NOW)
    assert d.allowed is False
    assert d.reason == "principal_identity_control_chars"


def test_reject_control_chars_in_session_id():
    d = authorize_identity(_principal(), _session(session_id="sess\x00ion"), _requirement(), now=NOW)
    assert d.allowed is False
    assert d.reason == "session_control_chars"


def test_reject_control_chars_in_roles_and_assurance():
    d = authorize_identity(_principal(roles=frozenset({"manager\x00"})), _session(), _requirement(), now=NOW)
    assert d.allowed is False
    assert d.reason == "principal_role_control_chars"
    d = authorize_identity(_principal(assurance=frozenset({"mfa\t"})), _session(), _requirement(), now=NOW)
    assert d.allowed is False
    assert d.reason == "principal_assurance_control_chars"


def test_clean_identity_still_authorizes():
    d = authorize_identity(_principal(), _session(), _requirement(), now=NOW)
    assert d.allowed is True
    assert d.reason == "authorized"
