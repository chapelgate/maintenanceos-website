from pathlib import Path

import channels
import security


def test_dashboard_login_exposes_max_chars():
    source = (Path(__file__).resolve().parents[1] / "dashboard.py").read_text(encoding="utf-8")
    assert "max_chars=EMAIL_LOOKUP_MAX" in source
    assert "max_chars=LOGIN_PASSWORD_MAX" in source
    assert channels.EMAIL_LOOKUP_MAX == 320
    assert security.LOGIN_PASSWORD_MAX == 200
