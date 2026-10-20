# S1: Scanner Accuracy — Business Name Validator

## Problem
The scanner incorrectly extracts business names from 404/error pages, about pages, slug-like paths, and other junk. This resulted in ~8% wrong names in the golden set (e.g., "404 Not Found", "About Us", "plumbing-services" returned as business names).

## Solution
Add a `validateBusinessName` function that rejects:
- 404/error page titles ("404 Not Found", "Page Not Found", "Error", "Not Found")
- About/our-story patterns ("About", "About Us", "About Me", "Our Story")
- Generic/slug-like names ("Home", "Welcome", "Index", "plumbing-services", "about-us", "contact-us")
- File extensions (logo.jpg, image.png, document.pdf)
- Sentence-like text ("Welcome to our website", "We are the best plumbers in town.")
- Host-like names (example.com, www.example.co.uk)
- Single-word common nav terms (Services, Blog, FAQ, Contact, etc.)

Integrate this validator into the business name extraction pipeline (`acceptableName`, `fallbackBusinessName`, `chooseBusinessName`) and skip domain fallback for error pages.

## Acceptance Criteria
- `npm run benchmark:scanner -- --field=name --sites=golden` → Wrong ≤2%, Correct ≥80%
- Unit tests for `validateBusinessName` pass (covers all rejection categories and valid names)
- Integration tests verify 404/about/slug pages don't produce garbage business names

(End of file - total 31 lines)