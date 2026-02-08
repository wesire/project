import { test, expect } from '@playwright/test';

test.describe('Changes Route', () => {
  test('should navigate to changes page successfully', async ({ page }) => {
    // Navigate to the changes page
    await page.goto('/changes');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page header is visible
    await expect(page.getByRole('heading', { name: 'Change Log', level: 1 })).toBeVisible();
    
    // Check that subtitle text is present
    await expect(page.getByText('Track change orders with cost and time impact')).toBeVisible();
  });

  test('should display change orders table', async ({ page }) => {
    await page.goto('/changes');
    await page.waitForLoadState('networkidle');
    
    // Check that the Change Orders heading is visible
    await expect(page.getByRole('heading', { name: 'Change Orders', level: 2 })).toBeVisible();
    
    // Check that the table is rendered with headers
    await expect(page.getByRole('columnheader', { name: 'Change #' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Title' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Cost Impact' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Time Impact' })).toBeVisible();
  });

  test('should display summary cards', async ({ page }) => {
    await page.goto('/changes');
    await page.waitForLoadState('networkidle');
    
    // Check that summary cards are visible
    await expect(page.getByText('Total Changes')).toBeVisible();
    await expect(page.getByText('Approved')).toBeVisible();
    await expect(page.getByText('Total Cost Impact')).toBeVisible();
    await expect(page.getByText('Total Time Impact')).toBeVisible();
  });

  test('should display workflow information', async ({ page }) => {
    await page.goto('/changes');
    await page.waitForLoadState('networkidle');
    
    // Scroll to workflow section
    await page.getByRole('heading', { name: 'Change Order Workflow' }).scrollIntoViewIfNeeded();
    
    // Check workflow stages are visible
    await expect(page.getByText('DRAFT')).toBeVisible();
    await expect(page.getByText('SUBMITTED')).toBeVisible();
    await expect(page.getByText('UNDER REVIEW')).toBeVisible();
    await expect(page.getByText('APPROVED')).toBeVisible();
    await expect(page.getByText('IMPLEMENTED')).toBeVisible();
  });

  test('should have home navigation link', async ({ page }) => {
    await page.goto('/changes');
    await page.waitForLoadState('networkidle');
    
    // Check that the home link is visible
    const homeLink = page.getByRole('link', { name: '← Home' });
    await expect(homeLink).toBeVisible();
    
    // Verify it has the correct href
    await expect(homeLink).toHaveAttribute('href', '/');
  });

  test('should have new change order button', async ({ page }) => {
    await page.goto('/changes');
    await page.waitForLoadState('networkidle');
    
    // Check that the new change order button is visible
    await expect(page.getByRole('button', { name: '+ New Change Order' })).toBeVisible();
  });
});
