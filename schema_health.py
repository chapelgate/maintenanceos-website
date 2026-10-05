from sqlalchemy import inspect, text

from models import engine


REQUIRED_TABLES = {
    "clients","users","properties","residents","contractors","work_orders",
    "approvals","appointments","contractor_availability","contractor_acceptances","contractor_attempts",
    "quotes","completion_evidence","resident_confirmations","invoices",
    "communications","communication_deliveries","unmatched_inbound","automation_jobs",
    "data_lifecycle_holds","data_lifecycle_requests",
    "escalations","audit_events","tenant_boundaries","call_session_tenants",
    "critical_safety_states","incident_identities","channel_event_identities",
    "action_receipts","action_executions","invoice_identities","evidence_identities",
    "runtime_controls","call_sessions","call_events",
}
REQUIRED_UNIQUES = {
    "incident_identities": {("client_id","incident_key")},
    "channel_event_identities": {("client_id","source","event_key")},
    "action_receipts": {("client_id","scope","action_key")},
    "action_executions": {("client_id","action_type","action_key")},
    "invoice_identities": {("client_id","contractor_id","normalised_invoice_number")},
    "communication_deliveries": {("client_id","channel","action_key")},
    "call_events": {("call_session_id","event_key")},
    "contractor_attempts": {("work_order_id","contractor_id")},
}


def _unique_column_sets(inspector,table):
    found=set()
    for constraint in inspector.get_unique_constraints(table):
        columns=constraint.get("column_names") or []
        if columns:found.add(tuple(columns))
    for index in inspector.get_indexes(table):
        columns=index.get("column_names") or []
        if index.get("unique") and columns:found.add(tuple(columns))
    return found


def schema_report(bind=engine):
    try:
        inspector=inspect(bind);tables=set(inspector.get_table_names())
        missing_tables=sorted(REQUIRED_TABLES-tables)
        missing_uniques={}
        for table,expected in REQUIRED_UNIQUES.items():
            if table not in tables:continue
            absent=expected-_unique_column_sets(inspector,table)
            if absent:missing_uniques[table]=[list(columns) for columns in sorted(absent)]
        with bind.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {
            "database_reachable":True,
            "schema_compatible":not missing_tables and not missing_uniques,
            "missing_tables":missing_tables,
            "missing_unique_constraints":missing_uniques,
        }
    except Exception as exc:
        return {
            "database_reachable":False,
            "schema_compatible":False,
            "error_type":type(exc).__name__,
        }
