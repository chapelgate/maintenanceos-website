from permissions_policy import REQUIRED_PERMISSIONS_FEATURES, validate_permissions_policy


def test_validate_permissions_policy_valid():
    policy = ", ".join(REQUIRED_PERMISSIONS_FEATURES)
    assert validate_permissions_policy(policy) is True


def test_validate_permissions_policy_extra_features_ok():
    policy = ", ".join(REQUIRED_PERMISSIONS_FEATURES + ("extra=()",))
    assert validate_permissions_policy(policy) is True


def test_validate_permissions_policy_missing_feature():
    policy = ", ".join(f for f in REQUIRED_PERMISSIONS_FEATURES if f != "camera=()")
    assert validate_permissions_policy(policy) is False


def test_validate_permissions_policy_rejects_invalid():
    assert validate_permissions_policy("") is False
    assert validate_permissions_policy(None) is False
    assert validate_permissions_policy(123) is False
    assert validate_permissions_policy("camera=()\x00") is False
    assert validate_permissions_policy("\x01") is False
