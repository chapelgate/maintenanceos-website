import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  "/", "/about/", "/accessibility/", "/ai-receptionist/", "/blog/", "/contact/",
  "/cookies/", "/create/", "/demo/", "/faq/", "/features/", "/help/", "/how-it-works/",
  "/how-we-keep-control/", "/industries/", "/integrations/", "/pricing/", "/privacy/",
  "/property-maintenance-software/", "/security/", "/status/", "/subprocessors/",
  "/terms/", "/vulnerability-disclosure/", "/industries/landlords/", "/compare/",
];

const viewports = [
  { name: "iPhone 13", width: 390, height: 844 },
  { name: "Desktop Safari", width: 1280, height: 800 },
];

test.use({ browserName: "chromium" });

test.describe("WebKit accessibility checks", () => {
  for (const pagePath of pages) {
    for (const viewport of viewports) {
      test(`axe a11y checks on ${pagePath} at ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`http://localhost:3000${pagePath}`);

        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();

        const seriousOrCritical = accessibilityScanResults.violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical"
        );

        if (seriousOrCritical.length > 0) {
          console.log(`=== ${pagePath} ${viewport.name} ===`);
          for (const v of seriousOrCritical) {
            console.log(`  ${v.id}: ${v.description} (${v.impact})`);
            console.log(`    help: ${v.help}`);
            console.log(`    nodes: ${v.nodes.map((n) => n.target.join(",")).join("; ")}`);
          }
        }

        expect(seriousOrCritical).toEqual([]);
      });
    }
  }
});
