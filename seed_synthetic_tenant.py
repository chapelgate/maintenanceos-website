from models import Client,Contractor,Property,Resident,SessionLocal,TenantBoundary,init_db
from tenant_security import SYNTHETIC_MODE


LABEL="MaintenanceOS isolated voice test tenant"


def ensure_synthetic_tenant(session_factory=SessionLocal):
    init_db()
    with session_factory() as session:
        existing=session.query(TenantBoundary).filter_by(mode=SYNTHETIC_MODE,label=LABEL).first()
        if existing:return existing.client_id
        client=Client(name="SYNTHETIC VOICE TEST - NOT A REAL CLIENT",quote_approval_limit=0,invoice_variance_percent=0)
        session.add(client);session.flush()
        prop=Property(client_id=client.id,address="SYNTHETIC TEST PROPERTY - NO REAL ADDRESS",postcode="ZZ1 1ZZ",property_type="TEST ONLY",access_notes="NO REAL ACCESS DATA",emergency_notes="TEST DATA ONLY")
        session.add(prop);session.flush()
        resident=Resident(client_id=client.id,property_id=prop.id,name="SYNTHETIC TEST CALLER",phone="+440000000000",email="synthetic-resident@example.invalid")
        contractor=Contractor(client_id=client.id,name="SYNTHETIC TEST CONTRACTOR",trade="Plumber",postcode_coverage="ZZ1",email="synthetic-contractor@example.invalid",qualification_summary="TEST DATA ONLY",active=False)
        session.add_all([resident,contractor,TenantBoundary(client_id=client.id,mode=SYNTHETIC_MODE,label=LABEL)])
        session.commit();return client.id


if __name__=="__main__":
    tenant_id=ensure_synthetic_tenant()
    print("SYNTHETIC_VOICE_TENANT_READY")
    print(f"Synthetic test tenant ready (client id {tenant_id}).")
