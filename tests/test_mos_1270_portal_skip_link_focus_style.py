from api import _portal_page


def test_portal_skip_link_focus_style_present():
    html = _portal_page("T", "<p>x</p>")
    assert ".skip-link{position:absolute" in html
    assert ".skip-link:focus{position:static" in html
    assert 'class="skip-link"' in html
    assert 'tabindex="-1"' in html
