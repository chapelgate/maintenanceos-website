# mos-1273-portal-skip-link-assertion
FEATURE: align portal skip-link acceptance with aria-label markup from mos-1272

## What
test_portal_skip_link asserted adjacent href>Skip text. mos-1272 inserted aria-label between them, so decision page acceptance went red without losing the skip link.

## Acceptance
- decision page HTML still contains skip link to #main-content and Skip to content text
- assertion matches current aria-label markup
- source check and decision page check both pass
