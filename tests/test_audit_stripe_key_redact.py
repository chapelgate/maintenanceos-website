from audit_text import redact_detail

SK = "sk_live_51ABCDEFghijklmnopqrstuvwxyz012345"
RK = "rk_test_51ABCDEFghijklmnopqrstuvwxyz012345"
PK = "pk_live_51ABCDEFghijklmnopqrstuvwxyz012345"


def test_audit_redacts_stripe_secret_and_restricted_keys():
    redacted = redact_detail(f"keys {SK} {RK} leaked")
    assert SK not in redacted
    assert RK not in redacted
    assert "[REDACTED]" in redacted


def test_audit_leaves_publishable_key():
    assert PK in redact_detail(f"pub {PK}")


def test_audit_keeps_lifecycle_ids_with_stripe_key():
    redacted = redact_detail(f'{{"client_id": 42, "note": "{SK}"}}')
    assert '"client_id": 42' in redacted
    assert SK not in redacted
