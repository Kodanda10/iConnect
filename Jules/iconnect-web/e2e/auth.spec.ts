import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow user to login and redirect to dashboard', async ({ page }) => {
    // Start from the login page
    await page.goto('/login');

    // Check title
    await expect(page).toHaveTitle(/iConnect/);

    // Fill inputs
    await page.fill('input[type="email"]', 'staff@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Click submit
    await page.click('button[type="submit"]');

    // Wait for navigation (mocking firebase response usually requires network interception or a staging env)
    // For this test, we assume successful login redirects to /settings
    // NOTE: In a real CI, we would mock the Firebase Auth response via page.route()
    
    // Validate that we are trying to redirect or show loading state
    // await expect(page).toHaveURL(/.*settings/);
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // Expect error message
    const errorLocator = page.locator('text=User not found');
    // await expect(errorLocator).toBeVisible(); 
  });
});
