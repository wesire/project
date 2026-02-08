import { test, expect } from '@playwright/test';

test.describe('Portfolio Auth Guard', () => {
  test('should redirect unauthenticated users to login page', async ({ page, context }) => {
    // Clear any existing auth tokens
    await context.clearCookies();
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Try to access the portfolio page without authentication
    await page.goto('/portfolio');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Should show authentication required message
    await expect(page.getByText('Authentication Required')).toBeVisible();
    await expect(page.getByText('Please log in to access the portfolio dashboard')).toBeVisible();
    
    // Should have a Sign In button
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('should show sign in button that navigates to login with return URL', async ({ page, context }) => {
    // Clear any existing auth tokens
    await context.clearCookies();
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Navigate to portfolio
    await page.goto('/portfolio');
    await page.waitForLoadState('networkidle');
    
    // Click the Sign In button
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await expect(signInButton).toBeVisible();
    await signInButton.click();
    
    // Should navigate to login page with returnUrl parameter
    await page.waitForURL('**/login?returnUrl=/portfolio');
    expect(page.url()).toContain('/login?returnUrl=/portfolio');
  });

  test('should allow authenticated users to access portfolio', async ({ page, context }) => {
    // Clear any existing state
    await context.clearCookies();
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
    });

    // Set a mock auth token (simulating authenticated user)
    await page.goto('/portfolio');
    await page.evaluate(() => {
      localStorage.setItem('authToken', 'mock-token-for-testing');
    });
    
    // Reload the page with the auth token set
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should attempt to load the dashboard (will show loading or error, but not auth screen)
    // The actual API call will fail, but we're testing the auth guard logic
    const authRequired = page.getByText('Authentication Required');
    
    // Give it a moment to render
    await page.waitForTimeout(1000);
    
    // Either we see the dashboard content or an error, but NOT the auth required message
    const isAuthMessageVisible = await authRequired.isVisible().catch(() => false);
    
    // If auth message is NOT visible, the auth guard passed
    // If it IS visible, check if it's a session expired error (different from initial auth check)
    if (isAuthMessageVisible) {
      // Should be session expired error, not initial auth required
      await expect(page.getByText('Your session has expired')).toBeVisible();
    }
  });
});
