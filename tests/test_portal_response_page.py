import inspect

import api


def test_portal_submit_handlers_use_portal_page():
    for fn in (api.contractor_decision_submit, api.availability_submit, api.complete_submit):
        source = inspect.getsource(fn)
        assert "_portal_page" in source
        assert 'return f"<h2>' not in source
        assert 'return "<h2>' not in source
