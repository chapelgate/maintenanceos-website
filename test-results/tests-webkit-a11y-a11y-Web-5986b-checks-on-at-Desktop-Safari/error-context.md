# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/webkit-a11y/a11y.test.mjs >> WebKit accessibility checks >> axe a11y checks on / at Desktop Safari
- Location: tests/webkit-a11y/a11y.test.mjs:20:7

# Error details

```
Error: page.goto: Could not connect to localhost: Connection refused
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import AxeBuilder from '@axe-core/playwright';
  3   | 
  4   | // Use WebKit for all tests in this file
  5   | test.use({ browserName: 'webkit' });
  6   | 
  7   | const pages = ['/', '/create/', '/demo/', '/features/', '/pricing/', '/security/'];
  8   | const viewports = [
  9   |   { name: 'iPhone 13', width: 390, height: 844 },
  10  |   { name: 'Desktop Safari', width: 1280, height: 800 }
  11  | ];
  12  | 
  13  | test.describe('WebKit accessibility checks', () => {
  14  |   test.beforeEach(async ({ page }) => {
  15  |     // We'll set the viewport in each test
  16  |   });
  17  | 
  18  |   for (const pagePath of pages) {
  19  |     for (const viewport of viewports) {
  20  |       test(`axe a11y checks on ${pagePath} at ${viewport.name}`, async ({ page }) => {
  21  |         await page.setViewportSize({ width: viewport.width, height: viewport.height });
> 22  |         await page.goto(`http://localhost:3000${pagePath}`);
      |                    ^ Error: page.goto: Could not connect to localhost: Connection refused
  23  |         
  24  |         // Check for axe violations
  25  |         const accessibilityScanResults = await new AxeBuilder({ page })
  26  |           .withTags(['wcag2aa', 'wcag2a'])
  27  |           .analyze();
  28  |         
  29  |         // Filter violations to only serious and critical
  30  |         const seriousOrCritical = accessibilityScanResults.violations.filter(
  31  |           v => v.impact === 'serious' || v.impact === 'critical'
  32  |         );
  33  |         
  34  |         expect(seriousOrCritical).toEqual([]);
  35  |       });
  36  | 
  37  |       test(`focus and menu checks on ${pagePath} at ${viewport.name}`, async ({ page }) => {
  38  |         await page.setViewportSize({ width: viewport.width, height: viewport.height });
  39  |         await page.goto(`http://localhost:3000${pagePath}`);
  40  |         
  41  |         // Wait for page to load
  42  |         await page.waitForLoadState('load');
  43  |         
  44  |         // Find a visible header summary (the menu trigger)
  45  |         const summaryLocator = page.locator('header details > summary').filter({ visible: true });
  46  |         // If we find such a summary, test it
  47  |         if (await summaryLocator.count() > 0) {
  48  |           const summary = summaryLocator.first();
  49  |           // Ensure the summary is visible
  50  |           await expect(summary).toBeVisible();
  51  |           
  52  |           // Get the parent details element
  53  |           const details = summary.locator('xpath=..');
  54  |           
  55  |           // Check initial state: menu closed (details does not have open attribute)
  56  |           const isOpenInitially = await details.getAttribute('open') !== null;
  57  |           // We don't fail if it's open initially, we just note the state
  58  |           
  59  |           // Open menu with Enter
  60  |           await summary.focus();
  61  |           await summary.press('Enter');
  62  |           // Wait for menu to open - we'll use expect to wait for the attribute change
  63  |           await expect(details).toHaveAttribute('open');
  64  |           // Also check that the summary has aria-expanded="true"
  65  |           await expect(summary).toHaveAttribute('aria-expanded', 'true');
  66  |           
  67  |           // Close menu with Escape
  68  |           await summary.press('Escape');
  69  |           // Wait for menu to close
  70  |           await expect(details).not.toHaveAttribute('open');
  71  |           await expect(summary).toHaveAttribute('aria-expanded', 'false');
  72  |          }
  73  |          
  74  |          // Reload the page to start tab navigation from the top of a fresh page
  75  |          await page.goto(`http://localhost:3000${pagePath}`);
  76  |          await page.waitForLoadState('load');
  77  |          
  78  |          // Tab through the page and check focus visibility
  79  |         // We'll tab 50 times or until we have no more focusable elements
  80  |         let previousFocusedElement = null;
  81  |         for (let i = 0; i < 50; i++) {
  82  |           // Focus the page body to start from a known point
  83  |           if (i === 0) {
  84  |             await page.locator('body').focus();
  85  |           } else {
  86  |             await page.keyboard.press('Tab');
  87  |           }
  88  |           
  89  |           // Wait for focus to update
  90  |           await page.waitForTimeout(50);
  91  |           
  92  |           // Get the currently focused element
  93  |           const focusedElement = await page.locator(':focus');
  94  |           if (await focusedElement.count() === 0) {
  95  |             break; // No more focusable elements
  96  |           }
  97  |           
  98  |           // Check if we are looping (same element as before)
  99  |           if (previousFocusedElement && await focusedElement.elementHandle() === await previousFocusedElement.elementHandle()) {
  100 |             break; // We've looped
  101 |           }
  102 |           previousFocusedElement = focusedElement;
  103 |           
  104 |            // Check that the focused element is visible and has a visible focus indicator
  105 |            const isVisible = await focusedElement.isVisible();
  106 |            expect(isVisible).toBeTruthy();
  107 |            
  108 |            // Check that the element is at least partly inside the viewport
  109 |            const box = await focusedElement.boundingBox();
  110 |            expect(box).toBeTruthy();
  111 |            if (box) {
  112 |              const pageSize = await page.viewportSize();
  113 |              expect(box.y < pageSize.height && box.y + box.height > 0 && box.x < pageSize.width && box.x + box.width > 0).toBeTruthy();
  114 |            }
  115 |           
  116 |           // Note: We are not checking the focus indicator style due to complexity and variability.
  117 |           // The visibility and viewport check ensure that the focus is not lost and is within the viewport.
  118 |         }
  119 |         
  120 |         // Check for horizontal overflow: ensure that the page width does not exceed the viewport width
  121 |         const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  122 |         const viewportWidth = viewport.width;
```