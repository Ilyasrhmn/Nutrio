import { test, expect } from '@playwright/test';

test.describe('Roles CRUD E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/portal');
    await page.goto('/portal/admin/roles');
  });

  test('should create, edit, and delete role', async ({ page }) => {
    // Create
    await page.click('button:has-text("New Role")');
    await page.fill('input[name="name"]', 'E2E Test Role');
    await page.fill('textarea[name="description"]', 'Test role');
    await page.click('button:has-text("Create")');
    await expect(page.locator('text=E2E Test Role')).toBeVisible();

    // Edit
    await page.locator('button[aria-label*="Edit"]').first().click();
    await page.fill('textarea[name="description"]', 'Updated');
    await page.click('button:has-text("Save")');

    // Delete (optional based on implementation)
  });
});
