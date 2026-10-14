# Specification: WorkSmartOS is the master brand

## Objective
Make WorkSmartOS the primary brand of the marketing site. MaintenanceOS stays a product under that brand, in the same way ReceptionistOS is a product, and must not be the site wordmark, title suffix, or Open Graph site name.

## Owner correction
Andy Cartwright, 13 Oct 2026: WorkSmartOS is the brand. MaintenanceOS is only a product or sub-category under it. The spelling is one word, WorkSmartOS, not “WorkSmart OS”.

This supersedes the brand hierarchy in `specs/worksmart-umbrella/`. That change named WorkSmart OS as a parent line under a MaintenanceOS wordmark. This change inverts that hierarchy and removes the space.

## Acceptance criteria
- Public spelling is WorkSmartOS. Source under `src/` and `public/` does not contain “WorkSmart OS”.
- Header wordmark is WorkSmartOS.
- Document titles and meta titles use the suffix `| WorkSmartOS`. The root title is WorkSmartOS.
- `og:site_name` is WorkSmartOS.
- The home hero leads with WorkSmartOS. MaintenanceOS appears as the product, including the framing “WorkSmartOS MaintenanceOS”.
- The footer line is “WorkSmartOS by Chapelgate Technologies”, with the copyright still in the name Chapelgate Limited.
- The About page treats WorkSmartOS as the brand and MaintenanceOS as a product.
- A Products section lists MaintenanceOS and marks ReceptionistOS “Coming soon”. ReceptionistOS has no route and is not described as live.
- Legal pages keep Chapelgate Limited, the company number, and the registered office. No route or URL path changes.
- Colours stay background `#0A1728`, cards `#112A40`, accent `#67E8F9`, type Inter.
- `npm test` and `npx playwright test tests/webkit-a11y/` pass.

## Non-goals
- A public route or page for ReceptionistOS.
- Rewriting legal-page wording, emergency guidance, or safety-rule meaning.
- Rewriting the historical `specs/worksmart-umbrella/` record.
