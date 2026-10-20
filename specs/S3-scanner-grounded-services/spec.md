# S3: Scanner Accuracy - Grounded Services Extraction

## Overview
Rewrite services extraction to only use JSON-LD (makesOffer, hasOfferCatalog, serviceType) and service pages identified by isServiceSourceUrl (via serviceItemsUnderHeading). Explicitly reject nav-based and generic subheading-based extraction.

## Requirements
- Remove extractServiceSubheadings function (generic subheading-based extraction)
- Add extractGroundedServices function: JSON-LD + service pages via serviceItemsUnderHeading
- Update extractDraftFromHtml to use extractGroundedServices
- Drop nav/contact junk extraction per S3 acceptance criteria
- Only extract from JSON-LD structured data and service pages with list items under service headings

## Acceptance Criteria
- `npm run benchmark:scanner -- --field=services --sites=golden` → Correct ≥35%, Wrong ≤5%
- All local tests pass (268/268)
- Build passes, TypeScript clean, lint passes (pre-existing warnings only)
- Nav-based services extraction removed
- Generic subheading-based extraction removed

(End of file - total 18 lines)