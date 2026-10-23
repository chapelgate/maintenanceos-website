import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIREMENTS = ROOT / "requirements.txt"
REGISTER = ROOT / "docs" / "commercial_release" / "DIRECT_DEPENDENCY_REGISTER.json"
ALLOWED_STATUS = {"METADATA", "UNKNOWN"}
ROW_FIELDS = {"requirement", "version", "status", "licence_expression"}
SECRET_FIELD_PARTS = {"secret", "password", "token", "key", "credential"}


def load_requirement_names() -> list[str]:
    names: list[str] = []
    for raw in REQUIREMENTS.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        line = line.split(";", 1)[0].strip()
        name = re.split(r"[<>=!~]", line, maxsplit=1)[0].strip()
        if name:
            names.append(name)
    return names


def test_every_direct_requirement_has_a_row():
    register = json.loads(REGISTER.read_text())
    assert [row["requirement"] for row in register] == load_requirement_names()
    for row in register:
        assert set(row) == ROW_FIELDS
        assert row["status"] in ALLOWED_STATUS
        if row["status"] == "METADATA":
            assert row["licence_expression"].strip()


def test_unknown_rows_do_not_invent_a_licence():
    register = json.loads(REGISTER.read_text())
    for row in register:
        if row["status"] == "UNKNOWN":
            assert row["licence_expression"] == ""


def test_register_has_no_secret_fields():
    register = json.loads(REGISTER.read_text())
    for row in register:
        for field in row:
            lowered = field.lower()
            for marker in SECRET_FIELD_PARTS:
                assert marker not in lowered
