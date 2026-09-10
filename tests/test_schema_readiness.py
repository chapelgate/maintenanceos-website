from sqlalchemy import create_engine,text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import tenant_security
from models import Base,Client,TenantBoundary
from migrate_schema import migrate_action_receipts
from schema_health import schema_report


def test_fresh_schema_has_required_tables_and_uniqueness():
    engine=create_engine("sqlite://",connect_args={"check_same_thread":False},poolclass=StaticPool)
    Base.metadata.create_all(engine)
    report=schema_report(engine)
    assert report["database_reachable"]
    assert report["schema_compatible"],report


def test_schema_check_detects_old_global_action_receipt_constraint():
    engine=create_engine("sqlite://",connect_args={"check_same_thread":False},poolclass=StaticPool)
    with engine.begin() as connection:
        connection.execute(text("""
            CREATE TABLE action_receipts (
                id INTEGER PRIMARY KEY,
                scope VARCHAR(80), action_key VARCHAR(200), client_id INTEGER,
                UNIQUE (scope, action_key)
            )
        """))
    report=schema_report(engine)
    assert not report["schema_compatible"]
    assert report["missing_tables"]
    assert report["missing_unique_constraints"]["action_receipts"]==[
        ["client_id","scope","action_key"]
    ]


def test_isolated_internal_tenant_requires_same_synthetic_voice_boundary(monkeypatch):
    engine=create_engine("sqlite://",connect_args={"check_same_thread":False},poolclass=StaticPool)
    factory=sessionmaker(bind=engine,expire_on_commit=False);Base.metadata.create_all(engine)
    with factory() as session:
        client=Client(name="Synthetic readiness tenant");other=Client(name="Other")
        session.add_all([client,other]);session.flush()
        session.add(TenantBoundary(client_id=client.id,mode="SYNTHETIC_TEST",label="Readiness"))
        session.commit();client_id=client.id;other_id=other.id
    monkeypatch.setenv("VOICE_TENANT_MODE","isolated_test")
    monkeypatch.setenv("VOICE_TEST_CLIENT_ID",str(client_id))
    monkeypatch.setenv("INTERNAL_API_CLIENT_ID",str(client_id))
    assert tenant_security.internal_api_tenant_ready(factory)
    monkeypatch.setenv("INTERNAL_API_CLIENT_ID",str(other_id))
    assert not tenant_security.internal_api_tenant_ready(factory)


def test_local_migration_preserves_receipts_and_installs_tenant_unique_constraint():
    engine=create_engine("sqlite://",connect_args={"check_same_thread":False},poolclass=StaticPool)
    Base.metadata.create_all(engine)
    with engine.begin() as connection:
        connection.exec_driver_sql("DROP TABLE action_receipts")
        connection.exec_driver_sql("""
            CREATE TABLE action_receipts (
                id INTEGER NOT NULL PRIMARY KEY,
                scope VARCHAR(80) NOT NULL, action_key VARCHAR(200) NOT NULL,
                client_id INTEGER, work_order_id INTEGER,
                result_ref VARCHAR(200) NOT NULL DEFAULT '', created_at DATETIME NOT NULL,
                UNIQUE (scope,action_key)
            )
        """)
        connection.exec_driver_sql("""
            INSERT INTO action_receipts
                (id,scope,action_key,client_id,work_order_id,result_ref,created_at)
            VALUES (1,'TEST','same',NULL,NULL,'kept','2026-01-01 00:00:00')
        """)
    assert migrate_action_receipts(engine)
    assert not migrate_action_receipts(engine)
    report=schema_report(engine)
    assert report["schema_compatible"],report
    with engine.connect() as connection:
        assert connection.exec_driver_sql("SELECT result_ref FROM action_receipts WHERE id=1").scalar_one()=="kept"
