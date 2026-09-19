import importlib
import json
import os
import sys
import types
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


PAGES = ["Command Centre", "Work Orders", "Approvals", "System Health"]


class _SessionState(dict):
    def __getattr__(self, name):
        try:
            return self[name]
        except KeyError as exc:
            raise AttributeError(name) from exc

    def __setattr__(self, name, value):
        self[name] = value


class _Context:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def write(self, *args, **kwargs):
        return None

    def button(self, *args, **kwargs):
        return False

    def metric(self, *args, **kwargs):
        return None


class FakeStreamlit(types.ModuleType):
    def __init__(self, page, uid, events):
        super().__init__("streamlit")
        self._page = page
        self._events = events
        self.session_state = _SessionState(uid=uid)
        self.sidebar = self

    def __getattr__(self, name):
        if name in {"title", "subheader", "write", "json", "dataframe", "metric", "error", "warning", "success", "set_page_config", "caption"}:
            return lambda *args, **kwargs: self._events.append({"op": name, "args": [str(x) for x in args[:2]]})
        if name in {"text_input", "text_area"}:
            return lambda *args, **kwargs: "Synthetic supervisor reason"
        if name == "button":
            return lambda *args, **kwargs: False
        if name == "radio":
            return lambda *args, **kwargs: self._page
        if name == "selectbox":
            return lambda label, options, **kwargs: list(options)[0]
        if name == "columns":
            return lambda count, **kwargs: [_Context() for _ in range(count)]
        if name == "container":
            return lambda *args, **kwargs: _Context()
        if name == "rerun":
            return lambda: None
        if name == "stop":
            return lambda: (_ for _ in ()).throw(SystemExit("streamlit stop"))
        raise AttributeError(name)


def seed(db_path: Path):
    if db_path.exists():
        db_path.unlink()
    os.environ["DATABASE_URL"] = f"sqlite:///{db_path.as_posix()}"
    import models
    from security import hash_password

    models.Base.metadata.create_all(models.engine)
    with models.SessionLocal() as session:
        client = models.Client(name="Synthetic dashboard tenant")
        session.add(client)
        session.flush()
        user = models.User(client_id=client.id, email="dashboard@example.test", password_hash=hash_password("SyntheticPassword123!"), role="admin", active=True)
        prop = models.Property(client_id=client.id, address="9 Synthetic Dashboard Way", postcode="ZZ1 1ZZ")
        session.add_all([user, prop])
        session.flush()
        resident = models.Resident(client_id=client.id, property_id=prop.id, name="Synthetic Resident", phone="+440000000099", email="dash@example.test")
        contractor = models.Contractor(
            client_id=client.id,
            name="Synthetic Dashboard Contractor",
            trade="Plumber",
            postcode_coverage="ZZ1",
            qualification_summary="SYNTHETIC",
            qualification_expiry="2099-12-31",
            insurance_expiry="2099-12-31",
            active=True,
        )
        session.add_all([resident, contractor])
        session.flush()
        work_order = models.WorkOrder(
            client_id=client.id,
            property_id=prop.id,
            resident_id=resident.id,
            assigned_contractor_id=contractor.id,
            description="Synthetic dashboard tap leak",
            status="READY_FOR_DISPATCH",
            category="Plumbing",
            trade="Plumber",
            urgency="P3",
            ai_confidence=0.9,
        )
        session.add(work_order)
        session.flush()
        approval = models.Approval(client_id=client.id, work_order_id=work_order.id, approval_type="DISPATCH", proposed_action="Synthetic dispatch", reason="Dashboard smoke")
        session.add(approval)
        session.commit()
        return user.id


def main():
    output = Path(sys.argv[1])
    db_path = Path(sys.argv[2])
    uid = seed(db_path)
    results = []
    for page in PAGES:
        events = []
        sys.modules["streamlit"] = FakeStreamlit(page, uid, events)
        sys.modules.pop("dashboard", None)
        try:
            importlib.import_module("dashboard")
            ok = True
            error = ""
        except SystemExit as exc:
            ok = False
            error = str(exc)
        except Exception as exc:
            ok = False
            error = repr(exc)
        results.append({"page": page, "passed": ok, "error": error, "events_recorded": len(events)})
    payload = {
        "database": str(db_path),
        "pages": results,
        "passed": all(item["passed"] for item in results),
        "no_external_actions": True,
    }
    output.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    raise SystemExit(0 if payload["passed"] else 1)


if __name__ == "__main__":
    main()
