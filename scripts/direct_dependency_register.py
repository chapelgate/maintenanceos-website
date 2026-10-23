from __future__ import annotations

import json
import re
from importlib.metadata import PackageNotFoundError, distribution
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIREMENTS = ROOT / "requirements.txt"
OUT = ROOT / "docs" / "commercial_release" / "DIRECT_DEPENDENCY_REGISTER.json"


def direct_requirements(text: str) -> list[str]:
    names: list[str] = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        line = line.split(";", 1)[0].strip()
        token = re.split(r"[<>=!~]", line, maxsplit=1)[0].strip()
        if token:
            names.append(token)
    return names


def distribution_name(requirement: str) -> str:
    return requirement.split("[", 1)[0].strip()


def licence_from_metadata(dist) -> str:
    md = dist.metadata
    expr = md.get("License-Expression")
    if expr:
        return expr.strip()
    licence = md.get("License")
    if licence:
        return licence.strip()
    classifiers = md.get_all("Classifier") or []
    found = [item.strip() for item in classifiers if item.startswith("License ::") and item.strip()]
    if found:
        return "; ".join(found)
    return ""


def register_row(requirement: str) -> dict[str, str]:
    try:
        dist = distribution(distribution_name(requirement))
    except PackageNotFoundError:
        return {
            "requirement": requirement,
            "version": "UNKNOWN",
            "status": "UNKNOWN",
            "licence_expression": "",
        }
    licence = licence_from_metadata(dist)
    if not licence:
        return {
            "requirement": requirement,
            "version": dist.version,
            "status": "UNKNOWN",
            "licence_expression": "",
        }
    return {
        "requirement": requirement,
        "version": dist.version,
        "status": "METADATA",
        "licence_expression": licence,
    }


def build_register(text: str) -> list[dict[str, str]]:
    return [register_row(name) for name in direct_requirements(text)]


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(build_register(REQUIREMENTS.read_text()), indent=2) + "\n")


if __name__ == "__main__":
    main()
