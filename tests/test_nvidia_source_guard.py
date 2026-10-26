from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", "__pycache__", ".venv", "venv", "node_modules", ".pytest_cache"}
NEEDLES = ("integrate.api.nvidia.com", "api.nvidia.com")
SELF_NAME = Path(__file__).name


def _python_files():
    for path in ROOT.rglob("*.py"):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.name == SELF_NAME:
            continue
        yield path


def test_product_python_has_no_nvidia_api_host():
    hits = []
    for path in _python_files():
        text = path.read_text(encoding="utf-8", errors="replace")
        for needle in NEEDLES:
            if needle in text:
                hits.append(f"{path.relative_to(ROOT)}:{needle}")
    assert hits == []


def test_opencode_config_has_no_nvidia_api_host():
    hits = []
    for name in ("opencode.json", "opencode.jsonc"):
        path = ROOT / name
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        for needle in NEEDLES:
            if needle in text:
                hits.append(f"{name}:{needle}")
    assert hits == []


def test_guard_needles_cover_integrate_host():
    assert "integrate.api.nvidia.com" in NEEDLES
    assert any(needle.endswith("api.nvidia.com") for needle in NEEDLES)
