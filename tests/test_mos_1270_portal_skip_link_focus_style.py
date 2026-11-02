from api import _portal_page


def test_portal_skip_link_class_and_main_tabindex_remain():
    html = _portal_page("T", "<p>x</p>")
    assert 'class="skip-link"' in html
    assert 'tabindex="-1"' in html
