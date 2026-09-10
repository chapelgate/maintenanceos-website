import io

from dotenv import dotenv_values

from configure_test_credentials import (
    CONFIRMATION,
    CredentialEntryError,
    SAFETY_VALUES,
    TEST_NUMBER_CONFIRMATION_KEY,
    _replace_values_atomically,
    credential_report,
    enter_credentials,
    main,
)


SYNTHETIC = {
    "TWILIO_ACCOUNT_SID": "AC" + "1" * 32,
    "TWILIO_AUTH_TOKEN": "2" * 32,
    "TWILIO_PHONE_NUMBER": "+440000000101",
    "TWILIO_HUMAN_TRANSFER_NUMBER": "+440000000102",
    "OPENAI_API_KEY": "sk-synthetic-test-key-not-a-secret",
}


def _env_file(tmp_path):
    path = tmp_path / ".env"
    path.write_text(
        "\n".join(
            (
                "APP_SECRET=protected-app-secret",
                "INTERNAL_API_TOKEN=protected-internal-token",
                "VOICE_TEST_CLIENT_ID=synthetic-client-id",
                "INTERNAL_API_CLIENT_ID=synthetic-client-id",
                "VOICE_TENANT_MODE=isolated_test",
                "ENABLE_REALTIME_VOICE=true",
                "VERIFY_TWILIO_SIGNATURES=true",
                "ENABLE_LIVE_EMAIL=true",
                "ENABLE_LIVE_MESSAGING=true",
                "DEFAULT_AUTO_DISPATCH_LIMIT=99",
                "UNRELATED_SETTING=preserve-me",
                "",
            )
        ),
        encoding="utf-8",
    )
    return path


def test_hidden_entry_preserves_protected_settings_and_forces_voice_closed(tmp_path):
    path = _env_file(tmp_path)
    entries = iter(SYNTHETIC.values())
    report = enter_credentials(
        path,
        secret_reader=lambda _prompt: next(entries),
        confirmation_reader=lambda _prompt: CONFIRMATION,
    )
    values = dotenv_values(path)
    assert values["APP_SECRET"] == "protected-app-secret"
    assert values["INTERNAL_API_TOKEN"] == "protected-internal-token"
    assert values["VOICE_TEST_CLIENT_ID"] == "synthetic-client-id"
    assert values["INTERNAL_API_CLIENT_ID"] == "synthetic-client-id"
    assert values["UNRELATED_SETTING"] == "preserve-me"
    assert values["ENABLE_REALTIME_VOICE"] == "false"
    assert values["VERIFY_TWILIO_SIGNATURES"] == "false"
    assert values["ENABLE_LIVE_EMAIL"] == "false"
    assert values["ENABLE_LIVE_MESSAGING"] == "false"
    assert values["DEFAULT_AUTO_DISPATCH_LIMIT"] == "0"
    assert values[TEST_NUMBER_CONFIRMATION_KEY] == "true"
    assert all(values[key] == value for key, value in SYNTHETIC.items())
    assert report["protected_settings_preserved"] is True
    assert report["ready_for_provider_connectivity_checks"] is True


def test_boolean_check_never_outputs_credential_values(tmp_path):
    path = _env_file(tmp_path)
    _replace_values_atomically(
        path,
        {**SYNTHETIC, **SAFETY_VALUES, TEST_NUMBER_CONFIRMATION_KEY: "true"},
    )
    stdout = io.StringIO()
    stderr = io.StringIO()
    assert main(["--check"], env_path=path, stdout=stdout, stderr=stderr) == 0
    output = stdout.getvalue() + stderr.getvalue()
    assert all(value not in output for value in SYNTHETIC.values())
    assert '"ready_for_provider_connectivity_checks": true' in output


def test_failed_confirmation_retries_without_reentering_number(tmp_path):
    path = _env_file(tmp_path)
    entries = iter(SYNTHETIC.values())
    confirmations = iter(("NO", CONFIRMATION))
    diagnostics = io.StringIO()
    report = enter_credentials(
        path,
        secret_reader=lambda _prompt: next(entries),
        confirmation_reader=lambda _prompt: next(confirmations),
        diagnostics=diagnostics,
    )
    assert report["ready_for_provider_connectivity_checks"] is True
    assert "confirmation did not match" in diagnostics.getvalue()
    assert all(value not in diagnostics.getvalue() for value in SYNTHETIC.values())


def test_invalid_and_looping_numbers_retry_with_specific_redacted_errors(tmp_path):
    path = _env_file(tmp_path)
    invalid_phone = "020 1234 5678"
    entries = iter((
        SYNTHETIC["TWILIO_ACCOUNT_SID"],
        SYNTHETIC["TWILIO_AUTH_TOKEN"],
        invalid_phone,
        SYNTHETIC["TWILIO_PHONE_NUMBER"],
        SYNTHETIC["TWILIO_PHONE_NUMBER"],
        SYNTHETIC["TWILIO_HUMAN_TRANSFER_NUMBER"],
        SYNTHETIC["OPENAI_API_KEY"],
    ))
    diagnostics = io.StringIO()
    report = enter_credentials(
        path,
        secret_reader=lambda _prompt: next(entries),
        confirmation_reader=lambda _prompt: CONFIRMATION,
        diagnostics=diagnostics,
    )
    output = diagnostics.getvalue()
    assert report["ready_for_provider_connectivity_checks"] is True
    assert "must use E.164 format" in output
    assert "must differ from the dedicated Twilio test number" in output
    assert invalid_phone not in output
    assert all(value not in output for value in SYNTHETIC.values())


def test_existing_valid_credentials_are_preserved_and_not_prompted(tmp_path):
    path = _env_file(tmp_path)
    _replace_values_atomically(path, {
        "TWILIO_ACCOUNT_SID": SYNTHETIC["TWILIO_ACCOUNT_SID"],
        "TWILIO_AUTH_TOKEN": SYNTHETIC["TWILIO_AUTH_TOKEN"],
    })
    missing_values = iter((
        SYNTHETIC["TWILIO_PHONE_NUMBER"],
        SYNTHETIC["TWILIO_HUMAN_TRANSFER_NUMBER"],
        SYNTHETIC["OPENAI_API_KEY"],
    ))
    prompts = []

    def read_missing(prompt):
        prompts.append(prompt)
        return next(missing_values)

    report = enter_credentials(
        path,
        secret_reader=read_missing,
        confirmation_reader=lambda _prompt: CONFIRMATION,
    )
    values = dotenv_values(path)
    assert report["ready_for_provider_connectivity_checks"] is True
    assert values["TWILIO_ACCOUNT_SID"] == SYNTHETIC["TWILIO_ACCOUNT_SID"]
    assert values["TWILIO_AUTH_TOKEN"] == SYNTHETIC["TWILIO_AUTH_TOKEN"]
    assert not any("account SID" in prompt or "auth token" in prompt for prompt in prompts)


def test_accepted_missing_values_survive_later_cancellation(tmp_path):
    path = _env_file(tmp_path)
    _replace_values_atomically(path, {
        "TWILIO_ACCOUNT_SID": SYNTHETIC["TWILIO_ACCOUNT_SID"],
        "TWILIO_AUTH_TOKEN": SYNTHETIC["TWILIO_AUTH_TOKEN"],
    })
    entries = iter((
        SYNTHETIC["TWILIO_PHONE_NUMBER"],
        SYNTHETIC["TWILIO_HUMAN_TRANSFER_NUMBER"],
    ))

    def read_until_cancel(_prompt):
        try:
            return next(entries)
        except StopIteration:
            raise KeyboardInterrupt from None

    try:
        enter_credentials(
            path,
            secret_reader=read_until_cancel,
            confirmation_reader=lambda _prompt: CONFIRMATION,
        )
    except KeyboardInterrupt:
        pass
    else:
        raise AssertionError("Expected synthetic cancellation")
    values = dotenv_values(path)
    assert values["TWILIO_PHONE_NUMBER"] == SYNTHETIC["TWILIO_PHONE_NUMBER"]
    assert values["TWILIO_HUMAN_TRANSFER_NUMBER"] == SYNTHETIC["TWILIO_HUMAN_TRANSFER_NUMBER"]
    assert not values.get("OPENAI_API_KEY")
    assert values["ENABLE_REALTIME_VOICE"] == "false"
    assert values["VERIFY_TWILIO_SIGNATURES"] == "false"


def test_duplicate_managed_key_is_rejected_without_rewrite(tmp_path):
    path = _env_file(tmp_path)
    path.write_text(
        path.read_text(encoding="utf-8")
        + "OPENAI_API_KEY=first\nOPENAI_API_KEY=duplicate\n",
        encoding="utf-8",
    )
    original = path.read_bytes()
    try:
        _replace_values_atomically(path, {"OPENAI_API_KEY": SYNTHETIC["OPENAI_API_KEY"]})
    except CredentialEntryError as error:
        assert "Duplicate OPENAI_API_KEY" in str(error)
    else:
        raise AssertionError("Duplicate managed key was accepted")
    assert path.read_bytes() == original


def test_incomplete_check_fails_closed_with_boolean_report(tmp_path):
    path = _env_file(tmp_path)
    report = credential_report(path)
    assert report["ready_for_provider_connectivity_checks"] is False
    assert not all(report["credential_presence"].values())
    assert report["required_settings"]["dedicated_twilio_test_number"] == "missing"


def test_interactive_status_explains_number_roles_without_values(tmp_path):
    path = _env_file(tmp_path)
    _replace_values_atomically(
        path, {**SYNTHETIC, **SAFETY_VALUES, TEST_NUMBER_CONFIRMATION_KEY: "true"}
    )
    stdout = io.StringIO()
    stderr = io.StringIO()
    result = main(
        [],
        env_path=path,
        secret_reader=lambda _prompt: (_ for _ in ()).throw(AssertionError("unexpected prompt")),
        confirmation_reader=lambda _prompt: (_ for _ in ()).throw(AssertionError("unexpected confirmation")),
        stdout=stdout,
        stderr=stderr,
    )
    output = stdout.getvalue() + stderr.getvalue()
    assert result == 0
    assert "blank inbound webhook" in output
    assert "separate destination" in output
    assert "must be different" in output
    assert all(value not in output for value in SYNTHETIC.values())
