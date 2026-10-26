from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REQ_TXT = ROOT / "requirements.txt"
REQ_LOCK = ROOT / "requirements.lock"


def _parse_direct_ranges(text: str) -> dict[str, tuple[str, str]]:
    ranges: dict[str, tuple[str, str]] = {}
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        name, _, rest = line.partition(">=")
        lower, _, upper = rest.partition(",<")
        name = name.strip().lower()
        if "[" in name:
            name = name.split("[", 1)[0].strip()
        lower = lower.strip()
        upper = upper.strip()
        if not name or not lower or not upper:
            raise AssertionError(f"unsupported requirements.txt line: {raw!r}")
        ranges[name] = (lower, upper)
    return ranges


def _parse_lock_pins(text: str) -> dict[str, str]:
    pins: dict[str, str] = {}
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        name, sep, version = line.partition("==")
        if sep != "==" or not name.strip() or not version.strip():
            raise AssertionError(f"unsupported lock line: {raw!r}")
        pins[name.strip().lower()] = version.strip()
    return pins


def _version_tuple(version: str) -> tuple[int, ...]:
    parts: list[int] = []
    for chunk in version.split("."):
        digits = ""
        for ch in chunk:
            if ch.isdigit():
                digits += ch
            else:
                break
        if not digits:
            break
        parts.append(int(digits))
    return tuple(parts)


def _satisfies(version: str, lower: str, upper: str) -> bool:
    v = _version_tuple(version)
    return _version_tuple(lower) <= v < _version_tuple(upper)


def test_genai_imports():
    import google.genai as genai

    assert genai.__name__ == "google.genai"


def test_scheduler_imports():
    import apscheduler

    assert apscheduler.__name__ == "apscheduler"


def test_direct_pins_satisfy_requirements_txt():
    assert REQ_LOCK.is_file(), "requirements.lock missing"
    ranges = _parse_direct_ranges(REQ_TXT.read_text(encoding="utf-8"))
    pins = _parse_lock_pins(REQ_LOCK.read_text(encoding="utf-8"))
    for name, (lower, upper) in ranges.items():
        assert name in pins, f"direct requirement {name} missing from lock"
        pinned = pins[name]
        assert _satisfies(pinned, lower, upper), (
            f"{name}=={pinned} outside >={lower},<{upper}"
        )
