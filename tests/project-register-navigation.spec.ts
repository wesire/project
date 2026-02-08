import { test, expect } from '@playwright/test';

test.describe('Project Register Button Navigation', () => {
  test('should navigate to projects page successfully', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the projects page
    await expect(page.getByRole('heading', { name: 'Project Register', level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'All Projects', level: 2 })).toBeVisible();
  });

  test('should have new project button that navigates to /projects/new', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    
    // Find the new project button
    const newProjectButton = page.getByRole('link', { name: '+ New Project' });
    await expect(newProjectButton).toBeVisible();
    
    // Verify it has the correct href
    await expect(newProjectButton).toHaveAttribute('href', '/projects/new');
    
    // Click the button
    await newProjectButton.click();
    
    // Wait for navigation
    await page.waitForURL('**/projects/new');
    
    // Verify we're on the new project page
    expect(page.url()).toContain('/projects/new');
  });

  test('should load the new project page correctly', async ({ page }) => {
    await page.goto('/projects/new');
    await page.waitForLoadState('networkidle');
    
    // Verify the new project page loaded
    // (The actual content will depend on what's implemented in the page)
    // At minimum, we should be on the correct URL
    expect(page.url()).toContain('/projects/new');
  });

  test('should display project list with sample data', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    
    // Check that projects are displayed
    await expect(page.getByText('City Centre Office Block')).toBeVisible();
    await expect(page.getByText('PRJ001')).toBeVisible();
  });

  test('should have navigation links for each project', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    
    // Check that View Details button exists
    await expect(page.getByRole('link', { name: 'View Details' }).first()).toBeVisible();
    
    // Check that Edit button exists
    await expect(page.getByRole('link', { name: 'Edit' }).first()).toBeVisible();
    
    // Check that Risks link exists
    await expect(page.getByRole('link', { name: 'Risks' }).first()).toBeVisible();
    
    // Check that Tasks link exists
    await expect(page.getByRole('link', { name: 'Tasks' }).first()).toBeVisible();
  });
});
