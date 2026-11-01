import argparse
import csv

from models import SessionLocal, WorkOrder


EXPORT_WORK_ORDER_FIELDS = (
    "id",
    "client_id",
    "property_id",
    "resident_id",
    "source",
    "category",
    "trade",
    "urgency",
    "status",
    "assigned_contractor_id",
    "repeat_repair",
    "created_at",
    "updated_at",
    "closed_at",
    "description",
)

FORBIDDEN_EXPORT_FIELDS = frozenset(
    {
        "phone",
        "email",
        "password",
        "password_hash",
        "token",
        "api_key",
        "secret",
        "authorization",
        "access_notes",
        "emergency_notes",
        "session",
        "session_id",
        "csrf",
        "csrf_token",
        "cookie",
        "cookies",
        "bearer",
        "access_token",
        "refresh_token",
    }
)


def export_work_orders(client_id: int, path="work_orders_export.csv"):
    if not isinstance(client_id, int) or client_id <= 0:
        raise ValueError("A valid client_id is required")
    fields = list(EXPORT_WORK_ORDER_FIELDS)
    overlap = FORBIDDEN_EXPORT_FIELDS.intersection(fields)
    if overlap:
        raise RuntimeError(f"Export field allowlist includes forbidden keys: {sorted(overlap)}")
    with SessionLocal() as s:
        rows = s.query(WorkOrder).filter_by(client_id=client_id).order_by(WorkOrder.id).all()
        with open(path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fields)
            writer.writeheader()
            for x in rows:
                writer.writerow({k: getattr(x, k) for k in fields})
    return path


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export one tenant's work orders")
    parser.add_argument("client_id", type=int)
    parser.add_argument("path", nargs="?", default="work_orders_export.csv")
    args = parser.parse_args()
    print(export_work_orders(args.client_id, args.path))
