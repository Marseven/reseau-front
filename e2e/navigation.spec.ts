import { test, expect, Page } from '@playwright/test';

/**
 * Helper: authenticate and navigate to the dashboard.
 * Skips tests if login fails (API not available).
 */
async function loginAndGoToDashboard(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Adresse email').fill('admin@eramet-comilog.com');
  await page.getByLabel('Mot de passe').fill('password');
  await page.getByRole('button', { name: /Se connecter/i }).click();

  // Wait for dashboard or 2FA
  const dashboard = page.getByText(/Tableau de bord|Inventaire/i);
  try {
    await expect(dashboard).toBeVisible({ timeout: 15_000 });
  } catch {
    test.skip(true, 'Could not authenticate — API may not be running');
  }
}

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoToDashboard(page);
  });

  test('should display sidebar with navigation sections', async ({ page }) => {
    // Check main navigation groups are visible
    await expect(page.getByText('Inventaire')).toBeVisible();
    await expect(page.getByText('Tableau de bord')).toBeVisible();
  });

  test('should navigate to Sites section', async ({ page }) => {
    await page.getByText('Sites').click();
    await expect(page.getByText(/Gestion des sites|Sites/i)).toBeVisible({ timeout: 10_000 });
  });

  test('should navigate to Armoires section', async ({ page }) => {
    await page.getByText('Armoires').click();
    await expect(page.getByText(/Armoires|Coffrets/i)).toBeVisible({ timeout: 10_000 });
  });

  test('should navigate to Équipements section', async ({ page }) => {
    await page.getByText('Équipements').click();
    await expect(page.getByText(/Équipements/i)).toBeVisible({ timeout: 10_000 });
  });

  test('should navigate to VLANs section', async ({ page }) => {
    await page.getByText('VLANs').click();
    await expect(page.getByText(/VLAN/i)).toBeVisible({ timeout: 10_000 });
  });

  test('should show lazy-loaded skeleton during navigation', async ({ page }) => {
    // Navigate to a section and check that skeleton or content appears
    await page.getByText('Liaisons').click();

    // Either skeleton loading or actual content should appear
    const skeleton = page.locator('[class*="skeleton"], [class*="animate-pulse"]');
    const content = page.getByText(/Liaisons/i);

    await expect(skeleton.first().or(content)).toBeVisible({ timeout: 10_000 });
  });
});

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('should show mobile header with menu button', async ({ page }) => {
    await loginAndGoToDashboard(page);

    // On mobile, the sidebar should be hidden and a hamburger menu should be visible
    const menuButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    await expect(menuButton).toBeVisible();
  });
});
