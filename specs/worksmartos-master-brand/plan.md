# Plan: WorkSmartOS is the master brand

1. **Config.** Set `publicBrand` and `parentBrand` to `WorkSmartOS`. Keep `name` as `MaintenanceOS`, the product on this site.
2. **Chrome.** Header wordmark is WorkSmartOS. Footer wordmark is WorkSmartOS. Footer line is “WorkSmartOS by Chapelgate Technologies” and the copyright stays Chapelgate Limited.
3. **Meta.** Title template and Open Graph titles end `| WorkSmartOS`. Root title and `og:site_name` are WorkSmartOS. `applicationName` follows `publicBrand`.
4. **Hero and products.** Home hero heading is WorkSmartOS, with “WorkSmartOS MaintenanceOS” as the product line. A Products section lists WorkSmartOS MaintenanceOS and ReceptionistOS marked Coming soon. About states the same brand and product split. JSON-LD website name is WorkSmartOS; the software node is “WorkSmartOS MaintenanceOS”.
5. **Machine-readable copy.** `llms.txt` and `llms-full.txt` name WorkSmartOS as the brand, MaintenanceOS as the product, and ReceptionistOS as coming soon and not live.
6. **Legal and routes.** Do not edit Chapelgate Limited company details. Do not add or rename routes.
7. **Tests.** Update brand, title, and ReceptionistOS assertions. Run `npm test`, then build the static export and run `npx playwright test tests/webkit-a11y/`.
