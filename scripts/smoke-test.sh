#!/bin/bash

# Smoke Test Script for Regression Coverage
# This script runs a quick smoke test to verify key flows are working

set -e

echo "================================================"
echo "Running Regression Coverage Smoke Tests"
echo "================================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install --legacy-peer-deps
fi

# Check if Playwright is installed
if [ ! -d "node_modules/@playwright" ]; then
    echo -e "${YELLOW}Installing Playwright...${NC}"
    npm install --save-dev @playwright/test --legacy-peer-deps
fi

# Install Playwright browsers if not already installed
echo -e "${YELLOW}Ensuring Playwright browsers are installed...${NC}"
npx playwright install chromium --with-deps || true

echo ""
echo -e "${GREEN}Starting smoke tests...${NC}"
echo ""

# Run the tests with a timeout
# Using --grep to run only smoke-critical tests if needed
# For full coverage, we run all tests
npx playwright test --reporter=list --max-failures=5

# Capture the exit code
TEST_EXIT_CODE=$?

echo ""
echo "================================================"
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ All smoke tests passed!${NC}"
else
    echo -e "${RED}✗ Some tests failed. Check the output above.${NC}"
fi
echo "================================================"
echo ""
echo "To view the HTML report, run: npx playwright show-report"
echo ""

exit $TEST_EXIT_CODE
