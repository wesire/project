#!/bin/bash
# Setup Verification Script
# This script verifies that the application is properly configured

set -e

echo "🔍 Verifying Construction Project Control System Setup..."
echo ""

# Check Node.js version
echo "✓ Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required (found: $(node --version))"
    exit 1
fi
echo "  Node.js: $(node --version) ✓"

# Check npm version
echo "✓ Checking npm..."
NPM_VERSION=$(npm --version)
echo "  npm: $NPM_VERSION ✓"

# Check if dependencies are installed
echo "✓ Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed. Run: npm install --legacy-peer-deps"
    exit 1
fi
echo "  Dependencies installed ✓"

# Check .env file
echo "✓ Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Copy .env.example to .env and configure it."
    echo "  Run: cp .env.example .env"
else
    echo "  .env file exists ✓"
    
    # Check required environment variables
    if ! grep -q "DATABASE_URL=" .env; then
        echo "❌ DATABASE_URL not set in .env"
        exit 1
    fi
    if ! grep -q "JWT_SECRET=" .env; then
        echo "❌ JWT_SECRET not set in .env"
        exit 1
    fi
    echo "  Required variables configured ✓"
fi

# Check if Prisma Client is generated
echo "✓ Checking Prisma Client..."
if [ ! -d "node_modules/@prisma/client" ] || [ ! -d "node_modules/.prisma" ]; then
    echo "⚠️  Prisma Client not generated. Run: npx prisma generate"
else
    echo "  Prisma Client generated ✓"
fi

# Check TypeScript compilation
echo "✓ Checking TypeScript configuration..."
if npx tsc --noEmit > /dev/null 2>&1; then
    echo "  TypeScript compilation successful ✓"
else
    echo "⚠️  TypeScript compilation has errors (this may be normal if database isn't set up yet)"
fi

# Check if PostgreSQL is accessible (optional)
echo "✓ Checking database connection..."
if [ -f ".env" ]; then
    if npx prisma db execute --stdin < /dev/null > /dev/null 2>&1; then
        echo "  Database connection successful ✓"
    else
        echo "⚠️  Cannot connect to database. Make sure PostgreSQL is running and DATABASE_URL is correct."
        echo "  This is normal if you haven't set up the database yet."
    fi
fi

echo ""
echo "✅ Basic setup verification complete!"
echo ""
echo "Next steps:"
echo "1. Ensure PostgreSQL is running"
echo "2. Run: npx prisma generate"
echo "3. Run: npx prisma migrate dev --name init"
echo "4. Run: npm run dev"
echo "5. Open http://localhost:3000"
echo ""
echo "For detailed instructions, see README.md"
