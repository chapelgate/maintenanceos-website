from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SYNC = ROOT / "cloud-workers-sync" / "jobs" / "maintenanceos"


def test_post_call_email_worker_bundle_matches_canonical_files():
    """Prevent stale worker bundles from silently redeploying old email behavior."""
    pairs = [
        (ROOT / "call_notifications.py", SYNC / "call_notifications.py"),
        (ROOT / "email_gateway.py", SYNC / "email_gateway.py"),
        (ROOT / "tests" / "test_call_notifications.py", SYNC / "tests" / "test_call_notifications.py"),
        (ROOT / "tests" / "test_email_gateway_resend.py", SYNC / "tests" / "test_email_gateway_resend.py"),
    ]
    for canonical, mirrored in pairs:
        assert mirrored.exists(), f"missing worker mirror: {mirrored.relative_to(ROOT)}"
        assert canonical.read_bytes() == mirrored.read_bytes(), (
            f"worker mirror drift: {mirrored.relative_to(ROOT)} != "
            f"{canonical.relative_to(ROOT)}"
        )


def test_email_release_does_not_require_voice_files_in_sync_contract():
    """Document the surgical boundary: email parity is independently testable."""
    email_files = {
        "call_notifications.py",
        "email_gateway.py",
        "tests/test_call_notifications.py",
        "tests/test_email_gateway_resend.py",
    }
    manifest = (ROOT / "cloud-workers-sync" / "MANIFEST.txt").read_text(encoding="utf-8")
    for relative in email_files:
        assert f"jobs/maintenanceos/{relative}" in manifest
