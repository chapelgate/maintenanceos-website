from models import Client,Contractor,Property,Resident,SessionLocal,TenantBoundary,init_db
from tenant_security import SYNTHETIC_MODE


LABEL = "MaintenanceOS isolated voice test tenant"
CLIENT_NAME = "SYNTHETIC VOICE TEST - NOT A REAL CLIENT"
PROPERTY_ADDRESS = "SYNTHETIC TEST PROPERTY - NO REAL ADDRESS"
PROPERTY_POSTCODE = "ZZ1 1ZZ"
RESIDENT_NAME = "SYNTHETIC TEST CALLER"
RESIDENT_PHONE = "+440000000000"
RESIDENT_EMAIL = "synthetic-resident@example.invalid"
CONTRACTOR_NAME = "SYNTHETIC TEST CONTRACTOR"
CONTRACTOR_EMAIL = "synthetic-contractor@example.invalid"

REQUIRED_MARKERS = (
    "SYNTHETIC",
    "example.invalid",
    "ZZ1",
    "NOT A REAL",
)


def synthetic_seed_strings():
    return {
        "client_name": CLIENT_NAME,
        "property_address": PROPERTY_ADDRESS,
        "property_postcode": PROPERTY_POSTCODE,
        "resident_name": RESIDENT_NAME,
        "resident_phone": RESIDENT_PHONE,
        "resident_email": RESIDENT_EMAIL,
        "contractor_name": CONTRACTOR_NAME,
        "contractor_email": CONTRACTOR_EMAIL,
        "label": LABEL,
        "mode": SYNTHETIC_MODE,
    }


def assert_synthetic_markers(payload=None):
    data = synthetic_seed_strings() if payload is None else payload
    blob = " ".join(str(value) for value in data.values())
    missing = [marker for marker in REQUIRED_MARKERS if marker not in blob]
    if missing:
        raise AssertionError(f"Synthetic seed missing markers: {missing}")
    if not str(data["resident_email"]).endswith(".invalid"):
        raise AssertionError("Synthetic resident email must use .invalid")
    if not str(data["contractor_email"]).endswith(".invalid"):
        raise AssertionError("Synthetic contractor email must use .invalid")
    if not str(data["property_postcode"]).startswith("ZZ"):
        raise AssertionError("Synthetic postcode must use ZZ test range")
    return True


def ensure_synthetic_tenant(session_factory=SessionLocal):
    assert_synthetic_markers()
    init_db()
    with session_factory() as session:
        existing = session.query(TenantBoundary).filter_by(mode=SYNTHETIC_MODE, label=LABEL).first()
        if existing:
            return existing.client_id
        client = Client(name=CLIENT_NAME, quote_approval_limit=0, invoice_variance_percent=0)
        session.add(client)
        session.flush()
        prop = Property(
            client_id=client.id,
            address=PROPERTY_ADDRESS,
            postcode=PROPERTY_POSTCODE,
            property_type="TEST ONLY",
            access_notes="NO REAL ACCESS DATA",
            emergency_notes="TEST DATA ONLY",
        )
        session.add(prop)
        session.flush()
        resident = Resident(
            client_id=client.id,
            property_id=prop.id,
            name=RESIDENT_NAME,
            phone=RESIDENT_PHONE,
            email=RESIDENT_EMAIL,
        )
        contractor = Contractor(
            client_id=client.id,
            name=CONTRACTOR_NAME,
            trade="Plumber",
            postcode_coverage="ZZ1",
            email=CONTRACTOR_EMAIL,
            qualification_summary="TEST DATA ONLY",
            active=False,
        )
        session.add_all([resident, contractor, TenantBoundary(client_id=client.id, mode=SYNTHETIC_MODE, label=LABEL)])
        session.commit()
        return client.id


if __name__ == "__main__":
    tenant_id = ensure_synthetic_tenant()
    print("SYNTHETIC_VOICE_TENANT_READY")
    print(f"Synthetic test tenant ready (client id {tenant_id}).")
