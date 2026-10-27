import inspect
from unittest.mock import MagicMock, patch

import operations


def test_close_work_order_uses_lifecycle_roles():
    source = inspect.getsource(operations.close_work_order)
    assert "_authorised_user" in source
    assert "LIFECYCLE_ROLES" in source
    assert "s.get(User" not in source


def test_close_work_order_rejects_unauthorised_role_without_transition():
    session = MagicMock()
    wo = MagicMock()
    wo.client_id = 7
    wo.status = "READY_TO_CLOSE"
    with patch.object(operations, "SessionLocal") as session_local, \
         patch.object(operations, "require_noncritical", return_value=wo), \
         patch.object(operations, "_authorised_user", return_value=None) as auth, \
         patch.object(operations, "transition_work_order") as transition, \
         patch.object(operations, "audit") as audit:
        session_local.return_value.__enter__.return_value = session
        session_local.return_value.__exit__.return_value = None
        assert operations.close_work_order(11, 99) is False
        auth.assert_called_once_with(session, 99, 7, operations.LIFECYCLE_ROLES)
        transition.assert_not_called()
        audit.assert_not_called()


def test_close_work_order_allows_lifecycle_role():
    session = MagicMock()
    wo = MagicMock()
    wo.client_id = 7
    wo.id = 11
    wo.status = "READY_TO_CLOSE"
    user = MagicMock()
    user.id = 3
    with patch.object(operations, "SessionLocal") as session_local, \
         patch.object(operations, "require_noncritical", return_value=wo), \
         patch.object(operations, "_authorised_user", return_value=user), \
         patch.object(operations, "transition_work_order") as transition, \
         patch.object(operations, "audit") as audit:
        session_local.return_value.__enter__.return_value = session
        session_local.return_value.__exit__.return_value = None
        assert operations.close_work_order(11, 3) is True
        transition.assert_called_once()
        audit.assert_called_once()
        session.commit.assert_called_once()
