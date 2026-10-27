import operational_logging as ol

SK = "sk_live_51ABCDEFghijklmnopqrstuvwxyz012345"
RK = "rk_test_51ABCDEFghijklmnopqrstuvwxyz012345"
PK = "pk_live_51ABCDEFghijklmnopqrstuvwxyz012345"


def test_ops_log_redacts_stripe_secret_and_restricted_keys():
    redacted = ol._redact(f"keys {SK} {RK} leaked", "reason_code")
    assert SK not in redacted
    assert RK not in redacted
    assert "[REDACTED]" in redacted


def test_ops_log_leaves_publishable_key():
    assert PK in ol._redact(f"pub {PK}", "reason_code")


def test_ops_log_keeps_plain_reason_with_stripe_key_module():
    assert ol._redact("provider_timeout", "reason_code") == "provider_timeout"
