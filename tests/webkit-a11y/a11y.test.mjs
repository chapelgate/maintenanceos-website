import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Use WebKit for all tests in this file
test.use({ browserName: 'webkit' });

const pages = ['/', '/create/', '/demo/', '/features/', '/pricing/', '/security/'];
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
        await page.goto(`http://localhost:3000${pagePath}`);
        
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
        await page.goto(`http://localhost:3000${pagePath}`);
        
        // Wait for page to load
        await page.waitForLoadState('networkidle');
        
        // Find a menu button - we'll look for a button with aria-label containing "menu" or "open"
        // or a button that controls a menu (has aria-controls and aria-haspopup)
        const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="open" i], button[aria-haspopup="true"]');
        // If we find such a button, test it
        if (await menuButton.count() > 0) {
          const button = menuButton.first();
          // Ensure the button is visible
          await expect(button).toBeVisible();
          
          // Check initial state: menu closed
          const isExpandedInitially = await button.getAttribute('aria-expanded') === 'true';
          // We expect the menu to be closed initially (common pattern)
          // But we don't fail if it's open, we just note the state
          
          // Open menu with Enter
          await button.focus();
          await button.press('Enter');
          // Wait for menu to open
          await page.waitForTimeout(100);
          // Check that aria-expanded is now true
          await expect(button).toHaveAttribute('aria-expanded', 'true');
          // The controlled element should be visible
          const controlsId = await button.getAttribute('aria-controls');
          if (controlsId) {
            const controlledElement = page.locator(`#${controlsId}`);
            await expect(controlledElement).toBeVisible();
          }
          
          // Close menu with Escape
          await button.press('Escape');
          await page.waitForTimeout(100);
          // Check that aria-expanded is now false
          await expect(button).toHaveAttribute('aria-expanded', 'false');
          if (controlsId) {
            const controlledElement = page.locator(`#${controlsId}`);
            await expect(controlledElement).toBeHidden();
          }
        }
        
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
          
          // Check that the element is in the viewport (not obscured by fixed headers)
          const box = await focusedElement.boundingBox();
          expect(box).toBeTruthy();
          if (box) {
            const pageSize = await page.viewportSize();
            expect(box.x >= 0).toBeTruthy();
            expect(box.y >= 0).toBeTruthy();
            expect(box.x + box.width <= pageSize.width).toBeTruthy();
            expect(box.y + box.height <= pageSize.height).toBeTruthy();
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