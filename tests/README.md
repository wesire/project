# End-to-End Tests

This directory contains Playwright end-to-end tests for regression coverage.

## Test Files

- `portfolio-auth-guard.spec.ts` - Authentication and authorization tests for portfolio dashboard
- `changes-route.spec.ts` - Change orders page navigation and rendering tests
- `project-register-navigation.spec.ts` - Project list and new project navigation tests
- `risk-export-download.spec.ts` - Risk register and export functionality tests

## Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Install Playwright browsers
npx playwright install chromium

# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run specific test file
npx playwright test tests/portfolio-auth-guard.spec.ts
```

## Documentation

See [TESTING.md](../TESTING.md) for comprehensive documentation including:
- Detailed test descriptions
- Running and debugging tests
- CI/CD integration
- Best practices

## Test Results

Current status: ✅ All 19 tests passing

Run `npm run test:report` to view the latest HTML report.
