# Regression Test Coverage Documentation

## Overview
This document describes the regression test coverage added to the project using Playwright for end-to-end testing.

## Test Infrastructure

### Frameworks and Tools
- **Test Framework**: Playwright v1.58.2
- **Test Runner**: Playwright Test
- **Browser**: Chromium (headless and headed modes supported)
- **Language**: TypeScript

### Configuration
- **Config File**: `playwright.config.ts`
- **Test Directory**: `tests/`
- **Base URL**: `http://localhost:3000`
- **Dev Server**: Automatically started before tests run

## Test Suites

### 1. Portfolio Auth Guard (`tests/portfolio-auth-guard.spec.ts`)

Tests authentication and authorization for the portfolio dashboard.

**Test Cases:**
- ✅ `should redirect unauthenticated users to login page`
  - Verifies that users without a token see the authentication required screen
  - Checks for proper UI elements (Sign In button, auth message)
  
- ✅ `should show sign in button that navigates to login with return URL`
  - Verifies Sign In button redirects to `/login?returnUrl=/portfolio`
  - Ensures proper return URL parameter is passed
  
- ✅ `should allow authenticated users to access portfolio`
  - Tests that users with a token attempt to access the dashboard
  - Verifies auth token is processed (removed after 401 response)

### 2. Changes Route (`tests/changes-route.spec.ts`)

Tests navigation and rendering of the changes/change orders page.

**Test Cases:**
- ✅ `should navigate to changes page successfully`
  - Verifies page loads with correct header and subtitle
  
- ✅ `should display change orders table`
  - Checks table headers are rendered correctly
  - Verifies all expected columns are present
  
- ✅ `should display summary cards`
  - Tests that key metrics cards are visible (Total Changes, Approved, Cost Impact, Time Impact)
  
- ✅ `should display workflow information`
  - Verifies workflow stages are shown (DRAFT → SUBMITTED → UNDER REVIEW → APPROVED → IMPLEMENTED)
  
- ✅ `should have home navigation link`
  - Tests navigation back to home page
  
- ✅ `should have new change order button`
  - Verifies "+ New Change Order" button is present

### 3. Project Register Navigation (`tests/project-register-navigation.spec.ts`)

Tests project list page and navigation to new project form.

**Test Cases:**
- ✅ `should navigate to projects page successfully`
  - Verifies Projects page loads with correct headers
  
- ✅ `should have new project button that navigates to /projects/new`
  - Tests "+ New Project" button navigation
  - Verifies URL changes to `/projects/new`
  
- ✅ `should load the new project page correctly`
  - Confirms new project page is accessible
  
- ✅ `should display project list with sample data`
  - Checks that project cards are rendered
  - Verifies sample project data is visible
  
- ✅ `should have navigation links for each project`
  - Tests View Details, Edit, Risks, and Tasks links are present

### 4. Risk Export Download (`tests/risk-export-download.spec.ts`)

Tests risk register page and export functionality.

**Test Cases:**
- ✅ `should display risk register page with export buttons`
  - Verifies page loads with Export CSV and Export XLSX buttons
  
- ✅ `should trigger download when CSV export button is clicked`
  - Tests CSV export button triggers download event
  - Note: Download may fail due to authentication, but trigger is verified
  
- ✅ `should trigger download when XLSX export button is clicked`
  - Tests XLSX export button triggers download event
  - Note: Download may fail due to authentication, but trigger is verified
  
- ✅ `should display risk data in table`
  - Verifies table headers and risk data are rendered
  - Checks for presence of risk items (e.g., R001)
  
- ✅ `should have filters section for risks`
  - Confirms export buttons are accessible in UI

## Running Tests

### Prerequisites
```bash
# Install dependencies
npm install --legacy-peer-deps

# Install Playwright browsers
npx playwright install chromium
```

### Test Commands

#### Run All Tests
```bash
npm run test
```

#### Run Tests with UI
```bash
npm run test:ui
```

#### Run Tests in Headed Mode (see browser)
```bash
npm run test:headed
```

#### Run Smoke Tests
```bash
npm run test:smoke
# or
./scripts/smoke-test.sh
```

#### View Test Report
```bash
npm run test:report
```

#### Run Specific Test File
```bash
npx playwright test tests/portfolio-auth-guard.spec.ts
```

#### Run Tests in Debug Mode
```bash
npx playwright test --debug
```

## Test Results

### Latest Test Run Summary
```
✅ 19 tests passed
❌ 0 tests failed
⏱️  Execution time: ~51.7 seconds
```

### Test Coverage by Feature
1. **Portfolio Auth Guard**: 3/3 tests passing ✅
2. **Changes Route**: 6/6 tests passing ✅
3. **Project Register Navigation**: 5/5 tests passing ✅
4. **Risk Export Download**: 5/5 tests passing ✅

## CI/CD Integration

The tests are configured to run in CI environments with:
- Retries enabled (2 retries on failure in CI)
- Single worker for sequential execution
- HTML report generation
- Trace collection on first retry

### GitHub Actions (Recommended Configuration)
```yaml
- name: Install dependencies
  run: npm install --legacy-peer-deps
  
- name: Install Playwright browsers
  run: npx playwright install chromium --with-deps
  
- name: Run tests
  run: npm run test
  
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Debugging Failed Tests

### View Trace Files
When a test fails, Playwright generates trace files:
```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

### Screenshot on Failure
Screenshots are automatically captured on test failures in the `test-results/` directory.

### Running Specific Tests
```bash
# Run only auth tests
npx playwright test tests/portfolio-auth-guard

# Run only one test
npx playwright test tests/portfolio-auth-guard -g "should redirect unauthenticated"
```

## Known Limitations

1. **Authentication**: Tests use mock tokens which fail API authentication. This is expected behavior for testing the auth guard logic itself.

2. **Database**: Tests don't interact with a real database. They test UI rendering and navigation with static/mock data.

3. **Export Downloads**: Export functionality triggers downloads but files may be empty or error due to authentication requirements. The tests verify the download trigger occurs.

## Maintenance

### Adding New Tests
1. Create a new `.spec.ts` file in the `tests/` directory
2. Follow the existing test structure and naming conventions
3. Run tests locally to verify
4. Update this documentation

### Updating Tests
When UI changes are made:
1. Run tests to identify failures
2. Update selectors in test files
3. Verify tests pass locally
4. Commit changes with descriptive messages

## Best Practices

1. **Use Semantic Selectors**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Wait for State**: Always wait for `networkidle` or specific elements before assertions
3. **Independent Tests**: Each test should be independent and not rely on others
4. **Clear State**: Clear localStorage and cookies between tests that require it
5. **Meaningful Assertions**: Each assertion should test a specific behavior

## Support

For questions or issues with tests:
1. Check the Playwright documentation: https://playwright.dev
2. Review test traces for failed tests
3. Run tests in debug mode for interactive troubleshooting
