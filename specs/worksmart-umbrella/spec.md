# Specification: WorkSmart OS umbrella, contact address, and orb removal

## Objective
Ship three owner-requested changes on the MaintenanceOS marketing site in one pull request: remove decorative glow orbs, replace the public contact email, and name WorkSmart OS as the parent brand.

## Acceptance criteria
- Decorative floating orbs and blurred glow circles are gone from backgrounds and heroes. `IntakeOrbAccent`, `SiriOrbCloud`, and `HomeHeroVisual` are removed, along with their CSS and keyframes (`intake-idle`, `intake-halo`, `intake-sheen`). Page layout otherwise stays as it is.
- Every public contact email on pages, the shared legal contact line, the enquiry fallback, FAQ, and tests is `info@chapelgatetechnologies.com`. Privacy, cookies, terms, and accessibility copy stays verbatim apart from that address.
- MaintenanceOS remains the product name. WorkSmart OS is the parent brand in the header lockup, the footer line “MaintenanceOS is part of WorkSmart OS, by Chapelgate Technologies”, page title and meta suffixes, Open Graph site name, and the About page. The company in legal text stays Chapelgate Limited / Chapelgate Technologies. No sibling-product pages or claims.
- Routes are unchanged. Colours stay background `#0A1728`, cards `#112A40`, accent `#67E8F9`, type Inter. Text that this change adds meets 4.5:1 contrast.
- `npm test` and `npx playwright test tests/webkit-a11y/` pass.

## Non-goals
- New product pages for ReceptionOS or other siblings.
- Rewriting historical decision logs.
- Changing emergency guidance, safety-rule meaning, or legal page wording beyond the email address.
