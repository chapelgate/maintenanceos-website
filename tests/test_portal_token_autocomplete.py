import inspect

import api


def test_portal_token_inputs_have_autocomplete():
    for fn in (api.contractor_decision, api.availability_form, api.complete_form):
        source = inspect.getsource(fn)
        assert 'autocomplete="one-time-code"' in source
