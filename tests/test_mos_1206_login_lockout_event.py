import security


def setup_function():
    security._login_failures.clear()


def test_lockout_threshold_emits_operational_event(monkeypatch):
    events = []

    def capture(event, **fields):
        events.append((event, fields))

    monkeypatch.setenv("ENABLE_STRUCTURED_LOGGING", "true")
    monkeypatch.setattr(security, "operational_event", capture)
    email = "pilot@example.com"
    now = 1_700_000_000.0
    for i in range(security.LOGIN_LOCKOUT_MAX_ATTEMPTS - 1):
        security.record_login_failure(email, now=now + i)
    assert not any(name == "login_lockout" for name, _ in events)
    security.record_login_failure(email, now=now + security.LOGIN_LOCKOUT_MAX_ATTEMPTS)
    assert sum(1 for name, _ in events if name == "login_lockout") == 1
    event, fields = next((n, f) for n, f in events if n == "login_lockout")
    assert fields.get("outcome") == "locked"
    assert fields.get("reason_code") == "login_lockout"
    joined = " ".join(str(fields) for _, fields in events)
    assert "pilot@" not in joined
    assert email not in joined


def test_further_failures_do_not_reemit(monkeypatch):
    events = []
    monkeypatch.setattr(security, "operational_event", lambda event, **fields: events.append(event))
    email = "pilot@example.com"
    now = 1_700_000_000.0
    for i in range(security.LOGIN_LOCKOUT_MAX_ATTEMPTS + 2):
        security.record_login_failure(email, now=now + i)
    assert events.count("login_lockout") == 1
