# Complete Setup Guide

This guide will walk you through setting up the Construction Project Control System from scratch.

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **PostgreSQL 14+** installed and running ([Download](https://www.postgresql.org/download/))
- **Git** for version control
- A code editor (VS Code recommended)

## 🚀 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd project
```

### Step 2: Install Dependencies

```bash
npm install --legacy-peer-deps
```

> **Note:** We use `--legacy-peer-deps` due to React 19 compatibility requirements with some dependencies.

### Step 3: Set Up PostgreSQL Database

#### Option A: Create Database with psql

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE construction_control;

# (Optional) Create a dedicated user
CREATE USER construction_app WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE construction_control TO construction_app;

# Exit
\q
```

#### Option B: Using pgAdmin

1. Open pgAdmin
2. Right-click on "Databases" → "Create" → "Database"
3. Name: `construction_control`
4. Click "Save"

### Step 4: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/construction_control"

# JWT Secret - Generate with: openssl rand -base64 32
JWT_SECRET="your-secure-random-secret-key"

# Environment
NODE_ENV="development"

# Optional
PORT=3000
```

> **Security Tip:** Generate a secure JWT_SECRET:
> ```bash
> openssl rand -base64 32
> ```

### Step 5: Generate Prisma Client

```bash
npx prisma generate
```

This creates the type-safe Prisma Client based on your schema.

### Step 6: Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Set up relationships and indexes
- Apply the schema to your database

### Step 7: Seed the Database (Optional)

```bash
npx prisma db seed
```

This creates test users with the following credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| PM | pm@example.com | pm123 |
| QS | qs@example.com | qs123 |
| Site | site@example.com | site123 |
| Viewer | viewer@example.com | viewer123 |

### Step 8: Start the Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

### Step 9: Verify Installation

Run the verification script:

```bash
bash scripts/verify-setup.sh
```

Or manually check:
- ✓ Visit http://localhost:3000
- ✓ API health check: http://localhost:3000/api/health (if implemented)
- ✓ Test login with seeded credentials

## 🧪 Testing the Setup

### Test Authentication API

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "Test123!",
    "role": "VIEWER"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### Explore with Prisma Studio

```bash
npx prisma studio
```

Opens a GUI at http://localhost:5555 to view and edit your database.

## 🔧 Troubleshooting

### Issue: Database connection fails

**Symptoms:**
```
Error: P1001: Can't reach database server
```

**Solutions:**
1. Check if PostgreSQL is running:
   ```bash
   # Linux/macOS
   sudo systemctl status postgresql
   
   # macOS with Homebrew
   brew services list
   ```

2. Verify DATABASE_URL in `.env`:
   - Check username/password
   - Verify database name exists
   - Check host and port (default: localhost:5432)

3. Test connection manually:
   ```bash
   psql postgresql://user:password@localhost:5432/construction_control
   ```

### Issue: Port 3000 already in use

**Solution 1:** Use a different port
```bash
PORT=3001 npm run dev
```

**Solution 2:** Kill the process using port 3000
```bash
# Find the process
lsof -i :3000

# Kill it (replace PID with actual process ID)
kill -9 PID
```

### Issue: Prisma Client not found

**Symptoms:**
```
Cannot find module '@prisma/client'
```

**Solution:**
```bash
npm install --legacy-peer-deps
npx prisma generate
```

### Issue: Migration fails

**Solution:**
```bash
# Reset the database (WARNING: This deletes all data)
npx prisma migrate reset

# Then run migrations again
npx prisma migrate dev --name init
```

### Issue: TypeScript errors

**Solution:**
```bash
# Clean and rebuild
rm -rf .next
npm run build
```

## 📦 Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Ensure these are set in your production environment:

```env
DATABASE_URL="postgresql://user:password@production-host:5432/dbname"
JWT_SECRET="your-production-secret-key"
NODE_ENV="production"
```

### Database Migrations in Production

```bash
# Apply migrations without prompts
npx prisma migrate deploy
```

## 🔐 Security Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Generate a strong JWT_SECRET
- [ ] Use environment variables for all secrets
- [ ] Enable SSL for database connections
- [ ] Set up proper CORS configuration
- [ ] Enable rate limiting
- [ ] Set up logging and monitoring
- [ ] Review RBAC permissions
- [ ] Enable HTTPS
- [ ] Set up automated backups

## 📚 Next Steps

1. **Explore the API**: See [API_REFERENCE.md](./API_REFERENCE.md)
2. **Understand the Architecture**: See [FEATURE_STRUCTURE.md](./FEATURE_STRUCTURE.md)
3. **Review Security**: See [SECURITY.md](./SECURITY.md)
4. **Start Development**: Add your first feature!

## 🆘 Getting Help

If you encounter issues:

1. Check this guide and the [README.md](./README.md)
2. Review [QUICKSTART.md](./QUICKSTART.md) for quick reference
3. Search existing issues in the repository
4. Create a new issue with:
   - Environment details (OS, Node version, PostgreSQL version)
   - Complete error messages
   - Steps to reproduce

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Ready to build?** 🚀 Start your development server and begin creating!
