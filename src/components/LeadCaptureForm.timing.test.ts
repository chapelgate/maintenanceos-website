import { test, expect } from "@playwright/test";

test.describe("LeadCaptureForm click timing regression", () => {
  test("button click completes under 1000ms - valid mailto flow", async ({ page }) => {
    await page.goto("/contact/");
    const form = page.locator("form[data-lead-type='contact']");
    await expect(form).toBeVisible();
    await form.locator('input[name="email"]').fill("test@example.com");
    await form.locator('input[name="name"]').fill("Synthetic Tester");
    await form.locator('textarea[name="message"]').fill("Timing regression test");
    
    const start = Date.now();
    await form.locator('button[type="submit"]').click();
    await page.waitForLoadState("networkidle");
    const ms = Date.now() - start;
    
    expect(ms).toBeLessThan(1000);
  });
  
  test("button click completes under 1000ms - honeypot", async ({ page }) => {
    await page.goto("/contact/");
    const form = page.locator("form[data-lead-type='contact']");
    await expect(form).toBeVisible();
    await form.locator('input[name="email"]').fill("test@example.com");
    await form.locator('input[name="website"]').fill("http://spam.example.com");
    
    const start = Date.now();
    await form.locator('button[type="submit"]').click();
    await page.waitForLoadState("networkidle");
    const ms = Date.now() - start;
    
    expect(ms).toBeLessThan(1000);
  });
  
  test("button click completes under 1000ms - invalid email", async ({ page }) => {
    await page.goto("/contact/");
    const form = page.locator("form[data-lead-type='contact']");
    await expect(form).toBeVisible();
    await form.locator('input[name="email"]').fill("not-an-email");
    await form.locator('input[name="name"]').fill("Synthetic Tester");
    
    const start = Date.now();
    await form.locator('button[type="submit"]').click();
    await page.waitForLoadState("networkidle");
    const ms = Date.now() - start;
    
    expect(ms).toBeLessThan(1000);
  });
  
  test("button click completes under 1000ms - honeypot submit", async ({ page }) => {
    await page.goto("/contact/");
    const form = page.locator("form[data-lead-type='contact']");
    await expect(form).toBeVisible();
    await form.locator('input[name="email"]').fill("test@example.com");
    await form.locator('input[name="website"]').fill("http://spam.example.com");
    
    const start = Date.now();
    await form.locator('button[type="submit"]').click();
    const ms = Date.now() - start;
    
    expect(ms).toBeLessThan(1000);
  });
});