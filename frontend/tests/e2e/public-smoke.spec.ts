import { expect, test } from '@playwright/test';

test.describe('public smoke', () => {
  test('landing page exposes the primary authentication journeys', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', {
      level: 1,
      name: 'Your body, your plan — built from one photo',
    })).toBeVisible();
    await expect(page.getByRole('img', {
      name: "The Trainix dashboard showing today's workout, nutrition progress, and weight trend",
    })).toBeVisible();

    const signupLink = page.getByRole('link', { name: 'Sign up free' });
    await expect(signupLink).toHaveAttribute('href', '/auth/signup');

    await page.getByRole('link', { name: 'Login', exact: true }).first().click();
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Welcome back' })).toBeVisible();
  });

  test('login form validates locally without calling the API', async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    await expect(page.getByText('Field is required')).toBeVisible();
    await expect(page.getByText(/Password must have at least one lowercase/)).toBeVisible();

    const password = page.getByRole('textbox', { name: 'Password', exact: true });
    await expect(password).toHaveAttribute('type', 'password');
    await page.getByRole('button', { name: 'Show password' }).click();
    await expect(password).toHaveAttribute('type', 'text');
  });
});
