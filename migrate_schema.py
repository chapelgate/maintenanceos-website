import argparse
import json
import shutil
from datetime import datetime
from pathlib import Path

from sqlalchemy import inspect

from models import Base,engine
from schema_health import schema_report


ACTION_RECEIPT_UNIQUE=("client_id","scope","action_key")


def _has_scoped_action_receipts(bind):
    inspector=inspect(bind)
    if "action_receipts" not in inspector.get_table_names():return True
    uniques={tuple(item.get("column_names") or []) for item in inspector.get_unique_constraints("action_receipts")}
    uniques.update(
        tuple(item.get("column_names") or []) for item in inspector.get_indexes("action_receipts")
        if item.get("unique")
    )
    return ACTION_RECEIPT_UNIQUE in uniques


def migrate_action_receipts(bind=engine):
    if _has_scoped_action_receipts(bind):return False
    if bind.dialect.name!="sqlite":
        raise RuntimeError("Automatic action-receipt migration is supported only for the local SQLite build")
    with bind.connect() as connection:
        connection.exec_driver_sql("PRAGMA foreign_keys=OFF");connection.commit()
        transaction=connection.begin()
        try:
            connection.exec_driver_sql("""
                CREATE TABLE action_receipts_migrating (
                    id INTEGER NOT NULL PRIMARY KEY,
                    scope VARCHAR(80) NOT NULL,
                    action_key VARCHAR(200) NOT NULL,
                    client_id INTEGER,
                    work_order_id INTEGER,
                    result_ref VARCHAR(200) NOT NULL DEFAULT '',
                    created_at DATETIME NOT NULL,
                    CONSTRAINT uq_action_client_scope_key UNIQUE (client_id,scope,action_key),
                    FOREIGN KEY(client_id) REFERENCES clients (id),
                    FOREIGN KEY(work_order_id) REFERENCES work_orders (id)
                )
            """)
            connection.exec_driver_sql("""
                INSERT INTO action_receipts_migrating
                    (id,scope,action_key,client_id,work_order_id,result_ref,created_at)
                SELECT id,scope,action_key,client_id,work_order_id,result_ref,created_at
                FROM action_receipts
            """)
            connection.exec_driver_sql("DROP TABLE action_receipts")
            connection.exec_driver_sql("ALTER TABLE action_receipts_migrating RENAME TO action_receipts")
            connection.exec_driver_sql("CREATE INDEX ix_action_receipts_scope ON action_receipts (scope)")
            connection.exec_driver_sql("CREATE INDEX ix_action_receipts_client_id ON action_receipts (client_id)")
            connection.exec_driver_sql("CREATE INDEX ix_action_receipts_work_order_id ON action_receipts (work_order_id)")
            transaction.commit()
        except Exception:
            transaction.rollback();raise
        finally:
            connection.exec_driver_sql("PRAGMA foreign_keys=ON");connection.commit()
        violations=connection.exec_driver_sql("PRAGMA foreign_key_check").all()
        if violations:raise RuntimeError("Foreign-key verification failed after schema migration")
    return True


def _backup_local_database(backup_dir: Path,bind=engine):
    if bind.dialect.name!="sqlite":return None
    source=Path(bind.url.database).resolve()
    if not source.exists():return None
    backup_dir.mkdir(parents=True,exist_ok=True)
    target=backup_dir/f"{source.stem}-before-{datetime.now().strftime('%Y%m%d-%H%M%S')}{source.suffix}"
    shutil.copy2(source,target)
    return target


def main():
    parser=argparse.ArgumentParser(description="Apply narrow local MaintenanceOS schema migrations")
    parser.add_argument("--apply",action="store_true")
    parser.add_argument("--backup-dir",type=Path,default=Path("evidence/schema-backups"))
    args=parser.parse_args()
    before=schema_report()
    result={"before":before,"applied":False,"backup":None}
    if args.apply and not before["schema_compatible"]:
        backup=_backup_local_database(args.backup_dir)
        result["backup"]=str(backup) if backup else None
        Base.metadata.create_all(engine)
        result["applied"]=migrate_action_receipts()
    result["after"]=schema_report()
    print(json.dumps(result,indent=2,sort_keys=True))


if __name__=="__main__":main()
