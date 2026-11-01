import os

from models import Client, TenantBoundary, init_db, SessionLocal
from pilot.landlord_vertical import (
    activate_landlord_vertical,
    deactivate_landlord_vertical,
    open_synthetic_portfolio,
    reset_landlord_vertical_for_tests,
)
from tenant_security import SYNTHETIC_MODE


def test_open_portfolio_reuses_existing_synthetic_boundary():
    init_db()
    reset_landlord_vertical_for_tests()
    os.environ["WORKSMART_VERTICAL"] = "landlordos"
    activate_landlord_vertical()
    try:
        with SessionLocal() as session:
            client = Client(
                name="SYNTHETIC VOICE TEST - NOT A REAL CLIENT",
                quote_approval_limit=0,
                invoice_variance_percent=0,
            )
            session.add(client)
            session.flush()
            cid = int(client.id)
            session.add(
                TenantBoundary(
                    client_id=cid,
                    mode=SYNTHETIC_MODE,
                    label="preexisting synthetic",
                )
            )
            session.commit()
        result = open_synthetic_portfolio(units=1)
        assert result["property_count"] >= 1
        with SessionLocal() as session:
            boundary = session.get(TenantBoundary, result["client_id"])
            assert boundary is not None
            assert boundary.mode == SYNTHETIC_MODE
    finally:
        deactivate_landlord_vertical()
