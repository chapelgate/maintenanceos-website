import inspect

import api


def test_contractor_form_method_is_post():
    assert api.CONTRACTOR_FORM_METHOD == "post"
    for fn in (api.contractor_decision, api.availability_form, api.complete_form):
        source = inspect.getsource(fn)
        assert "CONTRACTOR_FORM_METHOD" in source
        assert 'method="get"' not in source.casefold()


def test_contractor_forms_include_hidden_token():
    for fn in (api.contractor_decision, api.availability_form, api.complete_form):
        source = inspect.getsource(fn)
        assert 'name="token"' in source
        assert "type=\"hidden\"" in source or "type='hidden'" in source


def test_contractor_post_handlers_require_token_form():
    for fn in (
        api.contractor_decision_submit,
        api.availability_submit,
        api.complete_submit,
    ):
        source = inspect.getsource(fn)
        assert "token:str=Form(...)" in source or "token: str = Form(...)" in source
        assert "verify_link" in source
