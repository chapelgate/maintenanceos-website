# Update llms.txt

This spec describes the update to public/llms.txt to match the current site.

## Changes

- Removed prohibited strings: '#demo', 'optional save', 'launch list'
- Updated the primary action to 'Request an early demo' at /demo/
- Updated contact information to reflect that online enquiries are temporarily unavailable, so people should email andy@chapelgatehome.uk
- Updated the funnel path descriptions to remove 'optional save'
- Updated the conversion description to reflect the primary action
- Updated the demo page description to reflect the primary action
- Removed the 'Join launch list' line from the contact section

## Reasoning

The llms.txt file was out of date and contained strings that are no longer present on the site or are prohibited.

## Testing

- All existing tests pass
- Lint, typecheck, and build succeed