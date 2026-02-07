# Quick Start Guide

This guide will help you get the Construction Project Control system up and running in minutes.

## Prerequisites

Before you begin, ensure you have:
- Node.js 18 or higher installed
- PostgreSQL 14 or higher installed and running
- npm (comes with Node.js)

## Step 1: Install Dependencies

```bash
npm install --legacy-peer-deps
```

> **Note**: We use `--legacy-peer-deps` due to compatibility requirements with the Gantt chart library.

## Step 2: Set Up Database

1. Create a PostgreSQL database:
```sql
CREATE DATABASE construction_control;
```

2. Copy the environment template:
```bash
cp .env.example .env
```

3. Edit `.env` and update the DATABASE_URL:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/construction_control"
JWT_SECRET="your-secure-random-string-here"
NODE_ENV="development"
```

> **Important**: Replace `postgres:password` with your actual PostgreSQL credentials.

## Step 3: Initialize Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev --name init
```

## Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

## Step 5: Access the Application

Open your browser and navigate to:
- **Homepage**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Risk Register**: http://localhost:3000/risks
- **Projects**: http://localhost:3000/projects
- **Tasks**: http://localhost:3000/tasks
- **Cashflow**: http://localhost:3000/cashflow

## Common Issues & Solutions

### Issue: Database connection fails

**Solution**: Verify PostgreSQL is running and credentials are correct:
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U postgres -d construction_control
```

### Issue: Port 3000 is already in use

**Solution**: Either kill the process using port 3000 or use a different port:
```bash
# Use a different port
PORT=3001 npm run dev
```

### Issue: Prisma generate fails

**Solution**: Clear the Prisma cache and regenerate:
```bash
npx prisma generate --clear
npx prisma generate
```

## Production Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. Deploy!

### Deploy to Other Platforms

The app can be deployed to:
- **Heroku**: Add PostgreSQL add-on
- **AWS**: Use Elastic Beanstalk or ECS
- **DigitalOcean**: App Platform with managed PostgreSQL
- **Railway**: Simple deployment with built-in PostgreSQL

## Next Steps

1. **Create a user account**: Use the registration API endpoint
2. **Create your first project**: Navigate to the Projects page
3. **Add risks**: Use the Risk Register to track project risks
4. **Set up tasks**: Create sprints and tasks for your project
5. **Track cashflow**: Enter forecast and actual financial data

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npx prisma studio        # Open Prisma Studio (database GUI)
npx prisma migrate dev   # Create and run new migration
npx prisma generate      # Regenerate Prisma client
npx prisma db push       # Push schema changes without migration

# Code Quality
npm run lint             # Run ESLint
```

## API Testing with curl

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "name": "Admin User",
    "password": "secure-password",
    "role": "ADMIN"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "secure-password"
  }'
```

### Create a Project
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "projectNumber": "PRJ001",
    "name": "My First Project",
    "budget": 1000000,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "createdById": "USER_ID"
  }'
```

## Support

For issues or questions:
1. Check the main [README.md](README.md)
2. Review [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
3. Open an issue on GitHub

---

**Happy building! 🏗️**
