from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CODE_GLOBS = ("*.py", "*.toml", "*.cfg", "Dockerfile*", "requirements*.txt")


def test_clean_room_notice_exists():
    notice = (ROOT / "NOTICE").read_text()
    assert "CLEAN-ROOM" in notice
    assert "MicroRealEstate" in notice
    assert "SUL" in notice
    assert "ideas-only" in notice.lower() or "Ideas-only" in notice


def test_no_nvidia_vendor_in_src():
    banned = ("nvidia/", "nvcr.io", "meta-llama", "llama-weights")
    hits = []
    for pattern in ("**/*.py", "**/requirements*.txt", "**/pyproject.toml", "**/Dockerfile*"):
        for path in ROOT.glob(pattern):
            if ".git" in path.parts or "__pycache__" in path.parts or "tests" in path.parts:
                continue
            text = path.read_text(errors="ignore").lower()
            for needle in banned:
                if needle in text:
                    hits.append(f"{path}:{needle}")
    assert hits == [], hits
