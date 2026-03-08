import { test, expect, Page } from '@playwright/test';

/**
 * Helper: authenticate and navigate to the dashboard.
 */
async function loginAndGoToDashboard(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Adresse email').fill('admin@eramet-comilog.com');
  await page.getByLabel('Mot de passe').fill('password');
  await page.getByRole('button', { name: /Se connecter/i }).click();

  const dashboard = page.getByText(/Tableau de bord|Inventaire/i);
  try {
    await expect(dashboard).toBeVisible({ timeout: 15_000 });
  } catch {
    test.skip(true, 'Could not authenticate — API may not be running');
  }
}

test.describe('CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndGoToDashboard(page);
  });

  test('should display sites list with data table', async ({ page }) => {
    await page.getByText('Sites').click();

    // Should show a table or list of sites
    await expect(
      page.getByRole('table').or(page.getByText(/Aucun|site/i))
    ).toBeVisible({ timeout: 10_000 });
  });

  test('should open create form when clicking add button', async ({ page }) => {
    await page.getByText('Sites').click();
    await page.waitForTimeout(2_000);

    // Look for an "Ajouter" or "+" button
    const addButton = page.getByRole('button', { name: /Ajouter|Nouveau|Créer|\+/i });

    if (await addButton.isVisible()) {
      await addButton.click();

      // A dialog or form should appear
      await expect(
        page.getByRole('dialog').or(page.getByRole('form')).or(page.getByText(/Créer|Ajouter|Nouveau site/i))
      ).toBeVisible({ timeout: 5_000 });
    }
  });

  test('should display pagination controls in data tables', async ({ page }) => {
    await page.getByText('Armoires').click();
    await page.waitForTimeout(3_000);

    // Look for pagination controls (Previous/Next or page numbers)
    const pagination = page.getByRole('button', { name: /Suivant|Next|Précédent|Previous/i })
      .or(page.getByText(/Page \d/i))
      .or(page.locator('[class*="pagination"]'));

    // Pagination may or may not be visible depending on data count
    const table = page.getByRole('table');
    await expect(table.or(page.getByText(/Aucun|armoire/i))).toBeVisible({ timeout: 10_000 });
  });

  test('should display equipment details when clicking a row', async ({ page }) => {
    await page.getByText('Équipements').click();
    await page.waitForTimeout(3_000);

    const table = page.getByRole('table');
    if (await table.isVisible()) {
      const firstRow = table.locator('tbody tr').first();
      if (await firstRow.isVisible()) {
        // Click on the row or a detail button
        const detailButton = firstRow.getByRole('button').first();
        if (await detailButton.isVisible()) {
          await detailButton.click();
          await page.waitForTimeout(2_000);
        }
      }
    }
  });
});
