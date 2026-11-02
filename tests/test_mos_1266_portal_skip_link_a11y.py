from api import _portal_page


def test_portal_skip_link_has_class_and_main_tabindex():
    html = _portal_page("T", "<p>x</p>")
    assert 'class="skip-link"' in html
    assert 'href="#main-content"' in html
    assert "Skip to content" in html
    assert '<main id="main-content" tabindex="-1">' in html
    assert 'lang="en-GB"' in html
