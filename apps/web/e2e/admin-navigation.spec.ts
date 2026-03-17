import { test, expect } from '@playwright/test';

test.describe('Admin Access Control E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/portal');
  });

  test('should navigate to admin panel', async ({ page }) => {
    await page.goto('/portal/admin');
    await expect(page).toHaveURL('/portal/admin');
    await expect(page.locator('h1')).toContainText('Access Control');
  });

  test('should display navigation tabs', async ({ page }) => {
    await page.goto('/portal/admin');
    await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Roles' })).toBeVisible();
  });

  test('should show mobile hamburger menu on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/portal/admin');
    const menuButton = page.getByRole('button', { name: /menu/i });
    await expect(menuButton).toBeVisible();
    await menuButton.click();
    await expect(page.getByRole('link', { name: 'Roles' })).toBeVisible();
  });
});
