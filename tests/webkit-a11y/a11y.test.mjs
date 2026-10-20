import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Use WebKit for all tests in this file
test.use({ browserName: 'webkit' });

const locale = 'en-GB';
const pages = [`/${locale}/`, `/${locale}/create/`, `/${locale}/demo/`, `/${locale}/features/`, `/${locale}/pricing/`, `/${locale}/security/`];
const viewports = [
  { name: 'iPhone 13', width: 390, height: 844 },
  { name: 'Desktop Safari', width: 1280, height: 800 }
];

test.describe('WebKit accessibility checks', () => {
  test.beforeEach(async ({ page }) => {
    // We'll set the viewport in each test
  });

  for (const pagePath of pages) {
    for (const viewport of viewports) {
      test(`axe a11y checks on ${pagePath} at ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`http://localhost:3000${pagePath}`, { waitUntil: 'networkidle' });
        
        // Wait for any client-side hydration/navigation to complete
        await page.waitForLoadState('load');
        await page.waitForTimeout(500);
        
        // Check for axe violations
        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2aa', 'wcag2a'])
          .analyze();
        
        // Filter violations to only serious and critical
        const seriousOrCritical = accessibilityScanResults.violations.filter(
          v => v.impact === 'serious' || v.impact === 'critical'
        );
        
        expect(seriousOrCritical).toEqual([]);
      });

test(`focus and menu checks on ${pagePath} at ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`http://localhost:3000${pagePath}`, { waitUntil: 'networkidle' });
        
        // Wait for page to load and any client-side hydration to complete
        await page.waitForLoadState('load');
        await page.waitForTimeout(500);
        
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
          
          // Open menu with Enter
          await summary.focus();
          await summary.press('Enter');
          // Wait for menu to open - we'll use expect to wait for the attribute change
          await expect(details).toHaveAttribute('open', { timeout: 5000 });
          // Also check that the summary has aria-expanded="true"
          await expect(summary).toHaveAttribute('aria-expanded', 'true');
          
          // Close menu with Escape
          await summary.press('Escape');
          // Wait for menu to close
          await expect(details).not.toHaveAttribute('open');
          await expect(summary).toHaveAttribute('aria-expanded', 'false');
         }
         
          // Reload the page to start tab navigation from the top of a fresh page
          await page.goto(`http://localhost:3000${pagePath}`, { waitUntil: 'networkidle' });
          await page.waitForLoadState('load');
          await page.waitForTimeout(500);
         
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