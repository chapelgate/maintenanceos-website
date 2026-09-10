"""Local SQLite backup and restore verification for MaintenanceOS."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sqlite3
from contextlib import closing
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.engine import make_url

from clock import utcnow
from models import DB_URL
from schema_health import schema_report


def _sqlite_path(database_url: str) -> Path:
    url = make_url(database_url)
    if url.drivername != "sqlite" or not url.database or url.database == ":memory:":
        raise ValueError("Backup utility supports only file-backed SQLite databases")
    return Path(url.database).expanduser().resolve()


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _manifest_path(backup_path: Path) -> Path:
    return backup_path.with_suffix(backup_path.suffix + ".manifest.json")


def verify_backup(backup_path: str | Path) -> dict:
    backup = Path(backup_path).resolve()
    manifest_path = _manifest_path(backup)
    if not backup.is_file() or not manifest_path.is_file():
        return {"valid": False, "reason": "backup_or_manifest_missing"}
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {"valid": False, "reason": "invalid_manifest"}
    actual_hash = _sha256(backup)
    if manifest.get("sha256") != actual_hash:
        return {"valid": False, "reason": "hash_mismatch"}
    try:
        with closing(sqlite3.connect(backup)) as connection:
            integrity = connection.execute("PRAGMA integrity_check").fetchone()[0]
            foreign_key_errors = connection.execute("PRAGMA foreign_key_check").fetchall()
        bind = create_engine(f"sqlite:///{backup.as_posix()}")
        try:
            schema = schema_report(bind)
        finally:
            bind.dispose()
    except (sqlite3.DatabaseError, OSError) as exc:
        return {"valid": False, "reason": "database_unreadable", "error_type": type(exc).__name__}
    valid = integrity == "ok" and not foreign_key_errors and schema.get("schema_compatible", False)
    return {
        "valid": valid,
        "reason": "ok" if valid else "integrity_or_schema_failure",
        "sha256": actual_hash,
        "integrity_check": integrity,
        "foreign_key_error_count": len(foreign_key_errors),
        "schema_compatible": bool(schema.get("schema_compatible")),
    }


def create_backup(destination: str | Path, *, database_url: str = DB_URL) -> dict:
    source = _sqlite_path(database_url)
    if not source.is_file():
        raise FileNotFoundError(source)
    destination = Path(destination).resolve()
    if destination == source:
        raise ValueError("Backup destination must differ from the live database")
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix(destination.suffix + ".partial")
    if temporary.exists():
        temporary.unlink()
    try:
        with closing(sqlite3.connect(source)) as source_db, closing(sqlite3.connect(temporary)) as backup_db:
            source_db.backup(backup_db)
        os.replace(temporary, destination)
    finally:
        if temporary.exists():
            temporary.unlink()
    manifest = {
        "format": "maintenanceos-sqlite-backup-v1",
        "created_at_utc": utcnow().isoformat(timespec="seconds") + "Z",
        "source_filename": source.name,
        "backup_filename": destination.name,
        "sha256": _sha256(destination),
    }
    _manifest_path(destination).write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    verification = verify_backup(destination)
    if not verification["valid"]:
        raise RuntimeError(f"Backup verification failed: {verification['reason']}")
    return verification


def restore_backup(backup_path: str | Path, destination: str | Path) -> dict:
    backup = Path(backup_path).resolve()
    destination = Path(destination).resolve()
    if destination.exists():
        raise FileExistsError("Restore destination already exists")
    verification = verify_backup(backup)
    if not verification["valid"]:
        raise ValueError(f"Backup is not restorable: {verification['reason']}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix(destination.suffix + ".partial")
    try:
        with closing(sqlite3.connect(backup)) as backup_db, closing(sqlite3.connect(temporary)) as restored_db:
            backup_db.backup(restored_db)
        os.replace(temporary, destination)
    finally:
        if temporary.exists():
            temporary.unlink()
    restored_hash = _sha256(destination)
    if restored_hash != verification["sha256"]:
        destination.unlink(missing_ok=True)
        raise RuntimeError("Restored database hash does not match verified backup")
    return {"restored": True, "sha256": restored_hash, "destination": str(destination)}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    command = parser.add_subparsers(dest="command", required=True)
    backup = command.add_parser("backup")
    backup.add_argument("destination", type=Path)
    backup.add_argument("--database-url", default=DB_URL)
    verify = command.add_parser("verify")
    verify.add_argument("backup", type=Path)
    restore = command.add_parser("restore")
    restore.add_argument("backup", type=Path)
    restore.add_argument("destination", type=Path)
    args = parser.parse_args()
    if args.command == "backup":
        result = create_backup(args.destination, database_url=args.database_url)
    elif args.command == "verify":
        result = verify_backup(args.backup)
    else:
        result = restore_backup(args.backup, args.destination)
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result.get("valid", result.get("restored", False)) else 1


if __name__ == "__main__":
    raise SystemExit(main())
