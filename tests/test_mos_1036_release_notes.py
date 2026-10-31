import os


def test_release_notes_present():
    """CHANGELOG.md exists at repo root."""
    assert os.path.exists("CHANGELOG.md"), "CHANGELOG.md should exist at repo root"


def test_manifest_includes_product_profile():
    """CHANGELOG references product_profile module and version."""
    with open("CHANGELOG.md", "r") as f:
        content = f.read()
    assert "product_profile" in content.lower(), "CHANGELOG should mention product_profile"
    assert "0.1.0" in content or "Unreleased" in content, "CHANGELOG should have version entries"


def test_changelog_format():
    """CHANGELOG follows Keep a Changelog format."""
    with open("CHANGELOG.md", "r") as f:
        content = f.read()
    assert "## [Unreleased]" in content, "Should have Unreleased section"
    assert "### Added" in content or "### Changed" in content or "### Fixed" in content, "Should have change categories"
