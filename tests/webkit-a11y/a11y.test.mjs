import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Use WebKit for all tests in this file
test.use({ browserName: 'webkit' });

const pages = [
  '/',
  '/about/',
  '/accessibility/',
  '/ai-receptionist/',
  '/blog/',
  '/buyers/',
  '/compare/',
  '/contact/',
  '/cookies/',
  '/create/',
  '/demo/',
  '/faq/',
  '/features/',
  '/help/',
  '/how-it-works/',
  '/how-we-keep-control/',
  '/industries/',
  '/integrations/',
  '/pricing/',
  '/privacy/',
  '/property-maintenance-software/',
  '/security/',
  '/status/',
  '/subprocessors/',
  '/terms/',
  '/trust/',
  '/vulnerability-disclosure/',
  '/industries/landlords/',
  '/blog/ai-voice-demo-browser-only-what-it-means/',
  '/compare/worksmartos-vs-moneypenny/',
  '/integrations/google/',
  '/industries/housing-associations/',
  '/blog/why-safety-latches-matter-in-ai-receptionists/',
  '/compare/worksmartos-vs-phena/',
  '/integrations/outlook/',
  '/help/getting-started/',
  '/dashboard/',
  '/404/',
  '/industries/councils/',
  '/industries/property-managers/',
  '/blog/structured-repair-intake-vs-free-text-forms/',
  '/compare/worksmartos-vs-answerconnect/',
  '/integrations/calcom/',
  '/help/data-security/',
  '/help/billing-subscriptions/',
  '/help/getting-help/',
  '/help/faq/',
  '/industries/holiday-lets/',
  '/industries/letting-agents/',
  '/blog/uk-property-maintenance-software-landscape-2026/',
  '/compare/worksmartos-vs-fixflo/',
  '/integrations/calendly/',
  '/help/safety-latches/',
  '/help/accessibility-features/',
  '/help/troubleshooting-common-issues/',
  '/help/gas-safety-compliance/',
  '/industries/facilities-management/',
  '/industries/maintenance-companies/',
  '/blog/uk-maintenance-regulations-what-property-teams-need-to-know/',
  '/compare/worksmartos-vs-dialzara/',
  '/integrations/zapier/',
  '/help/repair-lifecycle/',
  '/compare/worksmartos-vs-fasthosts/',
  '/compare/worksmartos-vs-goodcall/',
  '/compare/worksmartos-vs-rosie/',
  '/integrations/hubspot/',
  '/help/emergency-procedures/',
  '/help/hmocompliance/',
  '/help/epc-compliance/',
  '/help/fire-risk-assessment/',
  '/help/contractor-compliance/',
  '/help/assigning-repairs/',
  '/help/tenant-portal/',
  '/help/user-management/',
  '/help/api-quickstart/',
  '/help/configuring-contractors/',
  '/help/contractor-quotes/',
  '/help/integration-overview/',
  '/help/mobile-app/',
  '/help/notification-settings/',
  '/help/release-notes/',
  '/help/reports-analytics/',
  '/help/webhook-guide/',
  '/compare/answerconnect/',
  '/compare/dialzara/',
  '/compare/fasthosts/',
  '/compare/fixflo/',
  '/compare/goodcall/',
  '/compare/moneypenny/',
  '/compare/phena/',
  '/compare/rosie/',
];
const viewports = [
  { name: 'iPhone 13', width: 390, height: 844 },
  { name: 'Desktop Safari', width: 1280, height: 800 }
];

test.describe('WebKit accessibility checks', () => {
  test.beforeEach(async () => {
    // We'll set the viewport in each test
  });

  for (const pagePath of pages) {
    for (const viewport of viewports) {
      test(`axe a11y checks on ${pagePath} at ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`http://localhost:3000${pagePath}`);
        
        // Check for axe violations
        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze();
        
        // Filter violations to only serious and critical
        const seriousOrCritical = accessibilityScanResults.violations.filter(
          v => v.impact === 'serious' || v.impact === 'critical'
        );
        
        expect(seriousOrCritical).toEqual([]);
      });

      test(`focus and menu checks on ${pagePath} at ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`http://localhost:3000${pagePath}`);
        
        // Wait for page to load
        await page.waitForLoadState('load');
        
        // Find a visible header summary (the menu trigger)
        const summaryLocator = page.locator('header details > summary').filter({ visible: true });
        // If we find such a summary, test it
        if (await summaryLocator.count() > 0) {
          const summary = summaryLocator.first();
          // Ensure the summary is visible
          await expect(summary).toBeVisible();
          
          // Get the parent details element
          const details = summary.locator('xpath=..');
          
          // Check initial state: menu closed (details does not have open attribute)
          const isOpenInitially = await details.getAttribute('open') !== null;
          // We don't fail if it's open initially, we just note the state
          void isOpenInitially;
          
          // Open menu with Enter
          await summary.focus();
          await summary.press('Enter');
          // Wait for menu to open - we'll use expect to wait for the attribute change
          await expect(details).toHaveAttribute('open');
          // Also check that the summary has aria-expanded="true"
          await expect(summary).toHaveAttribute('aria-expanded', 'true');
          
          // Close menu with Escape
          await summary.press('Escape');
          // Wait for menu to close
          await expect(details).not.toHaveAttribute('open');
          await expect(summary).toHaveAttribute('aria-expanded', 'false');
         }
         
         // Reload the page to start tab navigation from the top of a fresh page
         await page.goto(`http://localhost:3000${pagePath}`);
         await page.waitForLoadState('load');
         
         // Tab through the page and check focus visibility
        // We'll tab 50 times or until we have no more focusable elements
        let previousFocusedElement = null;
        for (let i = 0; i < 50; i++) {
          // Focus the page body to start from a known point
          if (i === 0) {
            await page.locator('body').focus();
          } else {
            await page.keyboard.press('Tab');
          }
          
          // Wait for focus to update
          await page.waitForTimeout(50);
          
          // Get the currently focused element
          const focusedElement = await page.locator(':focus');
          if (await focusedElement.count() === 0) {
            break; // No more focusable elements
          }
          
          // Check if we are looping (same element as before)
          if (previousFocusedElement && await focusedElement.elementHandle() === await previousFocusedElement.elementHandle()) {
            break; // We've looped
          }
          previousFocusedElement = focusedElement;
          
           // Check that the focused element is visible and has a visible focus indicator
           const isVisible = await focusedElement.isVisible();
           expect(isVisible).toBeTruthy();
           
           // Check that the element is at least partly inside the viewport
           const box = await focusedElement.boundingBox();
           expect(box).toBeTruthy();
           if (box) {
             const pageSize = await page.viewportSize();
             expect(box.y < pageSize.height && box.y + box.height > 0 && box.x < pageSize.width && box.x + box.width > 0).toBeTruthy();
           }
          
          // Note: We are not checking the focus indicator style due to complexity and variability.
          // The visibility and viewport check ensure that the focus is not lost and is within the viewport.
        }
        
        // Check for horizontal overflow: ensure that the page width does not exceed the viewport width
        const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const viewportWidth = viewport.width;
        expect(pageWidth).toBeLessThanOrEqual(viewportWidth);
      });
    }
  }
});
