# S15: Product Schema for /pricing/ Page

## Overview
Add Product JSON-LD structured data to the `/pricing/` page with honest pre-launch signaling.

## Requirements
- Product schema with `@type: "Product"`
- `availability: "https://schema.org/PreOrder"` (not generally available)
- `priceSpecification: null` (no list prices published)
- BreadcrumbList for `/pricing/`
- Single JSON-LD block per page (deduplicated)

## Acceptance Criteria
- Rich Results Test: "Product detected" with `availability: https://schema.org/PreOrder`
- `curl /pricing/ | grep -c 'application/ld+json'` = 1
- Build passes, TypeScript clean, lint passes, tests pass