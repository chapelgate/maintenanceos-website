from datetime import datetime, timedelta

from identity_contract import (
    AuthorizationRequirement,
    ExternalPrincipal,
    IdentitySession,
    authorize_identity,
    _has_control_chars,
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


def test_helper_rejects_del_and_c1():
    assert _has_control_chars("clean") is False
    assert _has_control_chars("a" + chr(0x7F)) is True
    assert _has_control_chars("a" + chr(0x80)) is True
    assert _has_control_chars("a" + chr(0x9F)) is True


def test_reject_del_and_c1_in_issuer_subject():
    d = authorize_identity(_principal(issuer="https://idp.example" + chr(0x7F)), _session(), _requirement(), now=NOW)
    assert d.allowed is False and d.reason == "principal_identity_control_chars"
    d = authorize_identity(_principal(subject="user" + chr(0x80) + "123"), _session(), _requirement(), now=NOW)
    assert d.allowed is False and d.reason == "principal_identity_control_chars"


def test_reject_del_and_c1_in_session_id():
    d = authorize_identity(_principal(), _session(session_id="sess" + chr(0x7F) + "ion"), _requirement(), now=NOW)
    assert d.allowed is False and d.reason == "session_control_chars"
    d = authorize_identity(_principal(), _session(session_id="sess" + chr(0x9F) + "ion"), _requirement(), now=NOW)
    assert d.allowed is False and d.reason == "session_control_chars"
