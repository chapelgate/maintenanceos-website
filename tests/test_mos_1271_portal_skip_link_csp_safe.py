from api import _portal_page


def test_portal_skip_link_has_no_inline_style_block():
    html = _portal_page("T", "<p>x</p>")
    assert "<style>" not in html
    assert 'class="skip-link"' in html
    assert 'href="#main-content"' in html
    assert 'tabindex="-1"' in html
