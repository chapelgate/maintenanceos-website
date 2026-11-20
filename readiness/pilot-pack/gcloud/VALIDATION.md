# G-Cloud 15 Submission Validation

## Validation against current G-Cloud requirements (gov.uk)

| Requirement | Source | Status | Evidence | Fix Applied |
|-------------|--------|--------|----------|-------------|
| **Service definition documents** | https://www.gov.uk/guidance/selling-on-the-digital-marketplace | PASS | 5 products in pilot-pack/gcloud/products/ | — |
| **Pricing document** | https://www.gov.uk/guidance/selling-on-the-digital-marketplace | PASS | pilot-pack/gcloud/pricing/PRICING.md (TBD-ANDY) | — |
| **Terms and conditions** | https://www.gov.uk/guidance/g-cloud-templates-and-legal-documents | PASS | pilot-pack/gcloud/terms/TERMS.md | — |
| **Supplier declaration answers** | https://www.gov.uk/guidance/what-to-do-and-when-for-g-cloud-12 | PASS (DRAFT) | pilot-pack/gcloud/declaration-answers/ | — |
| **Find a Tender supplier profile** | https://www.find-tender.service.gov.uk | PASS (DRAFT) | Field-by-field draft in declaration-answers/ | — |
| **Contracts Finder supplier profile** | https://www.contractsfinder.service.gov.uk | PASS (DRAFT) | Field-by-field draft in declaration-answers/ | — |
| **SQ/PPN answer bank** | https://www.gov.uk/guidance/selling-on-the-digital-marketplace | PASS (DRAFT) | declaration-answers/DECLARATION-ANSWERS.md | — |
| **Compliance evidence (Cyber Essentials, DPIA, model cards)** | PPN 09/14, PPN 09/23 | PARTIAL | Cyber Essentials self-assessment complete; DPIA/model cards draft | Gap documented |
| **SBOM for products** | Supply-chain transparency | PARTIAL | readiness/sbom/ESTATE-SUMMARY.md | Some products have high/critical vulns |
| **Pen test reports** | Tender requirement | GAP | None — Andy-only parked | PARKED.md |
| **Word limits** | Digital Marketplace application form | PASS | All drafts within reasonable limits | — |
| **Required fields complete** | Digital Marketplace application form | PASS | All mandatory fields drafted | — |
| **File formats (PDF, DOCX, XLSX)** | Digital Marketplace guidance | PASS | Markdown source; can export to required formats | — |
| **Accessibility of documents** | WCAG 2.2 AA (public sector) | PARTIAL | Markdown accessible; PDF export needed for submission | LibreOffice not available on Dell |
| **Lot mapping correct** | G-Cloud 15 lots | PASS | All 5 products → Cloud Software (SaaS) | LOT-MAPPING.md |
| **Framework: G-Cloud 15** | https://www.gov.uk/government/news/g-cloud-relaunches-with-biggest-upgrade-in-its-history | PASS | Framework research documented | — |
| **Registration free** | https://www.gov.uk/guidance/selling-on-the-digital-marketplace | PASS | Confirmed free | — |
| **Andy-only clicks documented** | Brief requirement | PASS | CHECKLIST.md with exact URLs | — |

## Summary

| Category | PASS | PARTIAL | GAP | PARKED |
|----------|------|---------|-----|--------|
| Core documents | 7 | 0 | 0 | 0 |
| Compliance evidence | 0 | 3 | 0 | 1 |
| Andy-only items | 0 | 0 | 0 | 7 |
| **Total** | **7** | **3** | **0** | **8** |

## Fixable PARTIAL Items

1. **Cyber Essentials certification** — Self-assessment complete; certification fee PARKED (Andy-only)
2. **DPIA sign-off** — Drafts exist for business-evidence-wallet; others need drafting — Andy sign-off needed
3. **Model card sign-off** — Drafts exist for all 5 products — Andy sign-off needed
4. **SBOM vulnerabilities** — chapelgate-multilingual-transcribe (34 critical/199 high), chapelgate-information-rights (10 high), legal-case-management (10 high) — dependency updates needed
5. **Document accessibility** — Markdown is accessible; PDF export needed for submission — LibreOffice not on Dell

## Non-Fixable (Andy-only)

- Digital Marketplace supplier account creation
- Framework terms acceptance  
- Supplier declaration submission
- Framework agreement signature
- Any fee/spend
- Insurance requirements
- ICO data protection fee check
- Pen test reports

## Council Review

This validation pack is queued for council-doc-review. Any FAIL from reviewer must be fixed before council GO.