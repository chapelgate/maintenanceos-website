# S14: Deduplicate JSON-LD Blocks, Add FAQPage + BreadcrumbList

## Problem

The website currently emits **two** JSON-LD script blocks on every funnel page:
1. Root layout includes `marketingJsonLd()` (Organization + WebSite)
2. Each funnel page includes `funnelPageJsonLd()` (duplicates Organization + WebSite + adds WebPage + SoftwareApplication)

This violates schema.org best practices and creates duplicate structured data.

The FAQ page has `faqPageJsonLd()` but no BreadcrumbList.

Subpages lack BreadcrumbList structured data.

## Requirements

1. **Exactly ONE JSON-LD script block per page** (no duplicates)
2. **FAQ page**: Single block with FAQPage + Organization + WebSite + BreadcrumbList
3. **All subpages**: Include BreadcrumbList in the single JSON-LD block
4. **Funnel pages**: Consolidate Organization + WebSite + WebPage + SoftwareApplication + BreadcrumbList
5. **Content pages**: Organization + WebSite + WebPage + BreadcrumbList
6. **Industry pages**: Already use `industryPageJsonLd()` which includes BreadcrumbList - no changes needed

## Acceptance Criteria

- `curl /faq/ | grep -c 'application/ld+json'` = 1 (exactly one block on FAQ)
- Rich Results Test: "FAQPage detected" on /faq/
- Rich Results Test: "BreadcrumbList detected" on all subpages
- Build passes, TypeScript clean, lint passes, tests pass