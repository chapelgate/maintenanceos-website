import json
from pathlib import Path

import pytest
from sqlalchemy import create_engine, text

from backup_restore import create_backup, restore_backup, verify_backup
from models import Base


def _sqlite_url(path: Path) -> str:
    return f"sqlite:///{path.as_posix()}"


def test_backup_is_hashed_verified_and_restorable(tmp_path):
    source = tmp_path / "source.db"
    bind = create_engine(_sqlite_url(source))
    Base.metadata.create_all(bind)
    with bind.begin() as connection:
        connection.execute(text("INSERT INTO clients (name,quote_approval_limit,invoice_variance_percent) VALUES ('Synthetic',250,10)"))
    bind.dispose()

    backup = tmp_path / "backup.db"
    created = create_backup(backup, database_url=_sqlite_url(source))
    assert created["valid"]
    assert created["schema_compatible"]
    manifest = json.loads((tmp_path / "backup.db.manifest.json").read_text(encoding="utf-8"))
    assert manifest["sha256"] == created["sha256"]

    restored = tmp_path / "restored.db"
    result = restore_backup(backup, restored)
    assert result["restored"]
    restored_bind = create_engine(_sqlite_url(restored))
    with restored_bind.connect() as connection:
        assert connection.execute(text("SELECT name FROM clients")).scalar_one() == "Synthetic"
    restored_bind.dispose()


def test_tampered_backup_fails_verification_and_restore(tmp_path):
    source = tmp_path / "source.db"
    bind = create_engine(_sqlite_url(source))
    Base.metadata.create_all(bind)
    bind.dispose()
    backup = tmp_path / "backup.db"
    create_backup(backup, database_url=_sqlite_url(source))
    with backup.open("ab") as stream:
        stream.write(b"tamper")
    assert verify_backup(backup) == {"valid": False, "reason": "hash_mismatch"}
    with pytest.raises(ValueError, match="not restorable"):
        restore_backup(backup, tmp_path / "restored.db")


def test_backup_refuses_live_path_and_restore_refuses_overwrite(tmp_path):
    source = tmp_path / "source.db"
    bind = create_engine(_sqlite_url(source))
    Base.metadata.create_all(bind)
    bind.dispose()
    with pytest.raises(ValueError, match="must differ"):
        create_backup(source, database_url=_sqlite_url(source))
    backup = tmp_path / "backup.db"
    create_backup(backup, database_url=_sqlite_url(source))
    existing = tmp_path / "existing.db"
    existing.write_bytes(b"preserve")
    with pytest.raises(FileExistsError, match="already exists"):
        restore_backup(backup, existing)
    assert existing.read_bytes() == b"preserve"
