import os

from models import (
    CallSessionTenant,
    Client,
    Contractor,
    Property,
    Resident,
    SessionLocal,
    TenantBoundary,
    WorkOrder,
)


SYNTHETIC_MODE = "SYNTHETIC_TEST"


class TenantAccessError(ValueError):
    pass


def configured_voice_client_id() -> int | None:
    if os.getenv("VOICE_TENANT_MODE", "").strip().lower() != "isolated_test":
        return None
    try:
        value = int(os.getenv("VOICE_TEST_CLIENT_ID", ""))
    except ValueError:
        return None
    return value if value > 0 else None


def configured_internal_client_id() -> int | None:
    try:
        value=int(os.getenv("INTERNAL_API_CLIENT_ID", ""))
    except ValueError:
        return None
    return value if value>0 else None


def internal_api_tenant_ready(session_factory=SessionLocal) -> bool:
    client_id=configured_internal_client_id()
    if client_id is None:return False
    try:
        with session_factory() as session:
            if not session.get(Client,client_id):return False
            if os.getenv("VOICE_TENANT_MODE","").strip().lower()=="isolated_test":
                boundary=session.get(TenantBoundary,client_id)
                return bool(
                    boundary and boundary.mode==SYNTHETIC_MODE
                    and configured_voice_client_id()==client_id
                )
            return True
    except Exception:
        return False


def isolated_voice_tenant_ready(session_factory=SessionLocal) -> bool:
    client_id = configured_voice_client_id()
    if client_id is None:
        return False
    try:
        with session_factory() as session:
            boundary = session.get(TenantBoundary, client_id)
            client = session.get(Client, client_id)
            return bool(client and boundary and boundary.mode == SYNTHETIC_MODE)
    except Exception:
        return False


def bind_call_to_tenant(session, call_session_id: int, client_id: int) -> None:
    boundary = session.get(TenantBoundary, client_id)
    if not boundary or boundary.mode != SYNTHETIC_MODE:
        raise TenantAccessError("Voice calls require an isolated synthetic tenant")
    existing = session.get(CallSessionTenant, call_session_id)
    if existing and existing.client_id != client_id:
        raise TenantAccessError("Call session is already bound to another tenant")
    if not existing:
        session.add(CallSessionTenant(call_session_id=call_session_id, client_id=client_id))


def call_client_id(session, call_session_id: int) -> int:
    binding = session.get(CallSessionTenant, call_session_id)
    if not binding:
        raise TenantAccessError("Call session has no tenant binding")
    return binding.client_id


def require_client_resource(
    session,
    client_id: int,
    *,
    property_id: int | None = None,
    resident_id: int | None = None,
    contractor_id: int | None = None,
    work_order_id: int | None = None,
) -> None:
    if not session.get(Client, client_id):
        raise TenantAccessError("Unknown client")
    prop = session.get(Property, property_id) if property_id is not None else None
    resident = session.get(Resident, resident_id) if resident_id is not None else None
    contractor = session.get(Contractor, contractor_id) if contractor_id is not None else None
    work_order = session.get(WorkOrder, work_order_id) if work_order_id is not None else None
    if prop and prop.client_id != client_id:
        raise TenantAccessError("Property belongs to another client")
    if property_id is not None and not prop:
        raise TenantAccessError("Unknown property")
    if resident:
        if resident.client_id != client_id:
            raise TenantAccessError("Resident belongs to another client")
        if prop and resident.property_id != prop.id:
            raise TenantAccessError("Resident does not belong to this property")
    elif resident_id is not None:
        raise TenantAccessError("Unknown resident")
    if contractor and contractor.client_id != client_id:
        raise TenantAccessError("Contractor belongs to another client")
    if contractor_id is not None and not contractor:
        raise TenantAccessError("Unknown contractor")
    if work_order:
        if work_order.client_id != client_id:
            raise TenantAccessError("Work order belongs to another client")
        if prop and work_order.property_id != prop.id:
            raise TenantAccessError("Work order does not belong to this property")
        if resident and work_order.resident_id not in (None, resident.id):
            raise TenantAccessError("Work order does not belong to this resident")
        if contractor and work_order.assigned_contractor_id not in (None, contractor.id):
            raise TenantAccessError("Contractor is not assigned to this work order")
    elif work_order_id is not None:
        raise TenantAccessError("Unknown work order")


def _has_control_chars(value: str) -> bool:
    return any(
        ord(ch) < 32
        or ord(ch) == 127
        or 0x80 <= ord(ch) <= 0x9F
        for ch in value
    )


def resident_by_phone_for_client(session, client_id: int, normalised_phone: str):
    from identity import normalise_phone

    if _has_control_chars(normalised_phone):
        return None
    for resident in session.query(Resident).filter_by(client_id=client_id, active=True).all():
        if normalise_phone(resident.phone) == normalised_phone:
            return resident
    return None
