from api import _portal_page


def test_portal_skip_link_has_aria_label():
    html = _portal_page("T", "<p>x</p>")
    assert 'aria-label="Skip to main content"' in html
    assert 'class="skip-link"' in html
    assert "<style>" not in html
