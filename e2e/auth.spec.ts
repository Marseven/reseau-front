import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display the login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
    await expect(page.getByLabel('Adresse email')).toBeVisible();
    await expect(page.getByLabel('Mot de passe')).toBeVisible();
    await expect(page.getByRole('button', { name: /Se connecter/i })).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Adresse email').fill('invalid@example.com');
    await page.getByLabel('Mot de passe').fill('wrongpassword');
    await page.getByRole('button', { name: /Se connecter/i }).click();

    // Should show an error toast
    await expect(page.getByText(/Erreur|incorrect/i)).toBeVisible({ timeout: 10_000 });
  });

  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto('/');

    // Should redirect to /login since not authenticated
    await expect(page).toHaveURL(/\/login/);
  });

  test('should login with valid credentials and redirect to dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Adresse email').fill('admin@eramet-comilog.com');
    await page.getByLabel('Mot de passe').fill('password');
    await page.getByRole('button', { name: /Se connecter/i }).click();

    // Should either redirect to dashboard or show 2FA step
    await expect(
      page.getByText(/Tableau de bord|Vérification 2FA/i)
    ).toBeVisible({ timeout: 15_000 });
  });

  test('should show 2FA step when user has 2FA enabled', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Adresse email').fill('admin@eramet-comilog.com');
    await page.getByLabel('Mot de passe').fill('password');
    await page.getByRole('button', { name: /Se connecter/i }).click();

    // If 2FA is enabled, we should see the verification step
    const twoFaHeading = page.getByRole('heading', { name: /Vérification 2FA/i });
    const dashboard = page.getByText(/Tableau de bord/i);

    // Wait for either 2FA prompt or dashboard
    await expect(twoFaHeading.or(dashboard)).toBeVisible({ timeout: 15_000 });

    // If 2FA step is visible, verify recovery code toggle exists
    if (await twoFaHeading.isVisible()) {
      await expect(page.getByText(/code de récupération/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /Retour/i })).toBeVisible();
    }
  });
});
