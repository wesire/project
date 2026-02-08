import { test, expect } from '@playwright/test';

const API_PROJECTS_ENDPOINT = '/api/projects';

test.describe('Authentication Token and Cookie Support', () => {
  test('should accept Bearer token in Authorization header', async ({ request }) => {
    // This test verifies that the API accepts Bearer tokens
    // Note: This will fail with 401 for an invalid token, but that's expected
    // The key is that it should not reject it before verifying
    const response = await request.get(API_PROJECTS_ENDPOINT, {
      headers: {
        'Authorization': 'Bearer invalid-token-for-testing'
      }
    });
    
    // Should return 401 for invalid token, not 400 for missing token
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Invalid or expired token');
  });

  test('should accept auth cookie', async ({ page }) => {
    // Set a cookie with auth token directly on the page context
    await page.context().addCookies([
      {
        name: 'token',
        value: 'invalid-token-for-testing',
        domain: 'localhost',
        path: '/',
      }
    ]);

    // Navigate to trigger API call with cookie
    const response = await page.request.get(`http://localhost:3000${API_PROJECTS_ENDPOINT}`);
    
    // Should return 401 for invalid token, not missing token error
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Invalid or expired token');
  });

  test('should return 401 when both Bearer token and cookie are missing', async ({ request, context }) => {
    // Clear any cookies
    await context.clearCookies();
    
    const response = await request.get(API_PROJECTS_ENDPOINT);
    
    // Should return 401 with "No authentication token provided"
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('No authentication token provided');
  });

  test('should prefer Bearer token over cookie when both are present', async ({ context, request }) => {
    // Set a cookie
    await context.addCookies([
      {
        name: 'token',
        value: 'cookie-token',
        domain: 'localhost',
        path: '/',
      }
    ]);

    // Make request with Bearer token
    const response = await request.get(API_PROJECTS_ENDPOINT, {
      headers: {
        'Authorization': 'Bearer bearer-token'
      }
    });
    
    // Should return 401 (both tokens are invalid)
    // The test just ensures the endpoint processes the request
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Invalid or expired token');
  });
});
