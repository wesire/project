# Construction Project Control System

A comprehensive full-stack construction project management and control application built with Next.js, TypeScript, Tailwind CSS, PostgreSQL, and Prisma.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Authentication & RBAC](#authentication--rbac)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)

## ✨ Features

### Core Modules

- **Project Register** - Complete project portfolio management with status tracking and budget monitoring
- **Risk Register** - Probability × Impact scoring with interactive heatmap visualization
- **Change Log** - Change order workflow with cost and time impact tracking
- **Tasks & Sprints** - Task management with dependencies and Gantt chart visualization
- **Resource Allocation** - Resource assignment and utilization tracking
- **Cashflow Management** - Forecast vs. actual tracking with variance analysis
- **Issues Log** - Issue tracking with priority-based management
- **RFI Management** - Request for Information submission and tracking
- **Procurement Log** - Purchase order and vendor management

### Dashboard & Analytics

- RAG Status Indicators (Red/Amber/Green)
- Schedule Performance Index (SPI) calculation
- Cost Performance Index (CPI) calculation
- Estimate at Completion (EAC) forecasting
- Real-time alerts and notifications

### Security & Compliance

- **Role-Based Access Control (RBAC)** with 5 roles:
  - **Admin** - Full system access
  - **PM (Project Manager)** - Project management and resource allocation
  - **QS (Quantity Surveyor)** - Financial and procurement management
  - **Site** - Site operations and task updates
  - **Viewer** - Read-only access
- **Complete Audit Trail** - Track all changes with user action logging
- **Secure Authentication** - JWT-based auth with bcrypt password hashing

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Next.js API Routes** - Serverless API functions
- **Prisma** - Modern ORM for type-safe database access
- **PostgreSQL** - Production-grade relational database

### Libraries
- **bcryptjs** - Secure password hashing
- **jsonwebtoken** - JWT authentication
- **zod** - Runtime type validation
- **date-fns** - Date formatting and manipulation

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 14.0 or higher ([Download](https://www.postgresql.org/download/))
- **npm** (comes with Node.js) or **yarn**
- **Git** for version control

### Verify Installation

```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
psql --version  # Should be 14.0 or higher
```

## 🚀 Getting Started

Follow these steps to set up the project locally:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project
```

### 2. Install Dependencies

```bash
npm install
```

> **Note**: If you encounter peer dependency issues, use `npm install --legacy-peer-deps`

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/construction_control"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-secure-random-secret-key"

# Environment
NODE_ENV="development"

# Optional: Server Port
PORT=3000
```

> **Important**: Replace `your_password` with your PostgreSQL password and generate a secure `JWT_SECRET` for production.

### 4. Set Up PostgreSQL Database

Create a new PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE construction_control;

# Exit psql
\q
```

### 5. Initialize Database Schema

Generate Prisma client and run migrations:

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

This will:
- Create all necessary tables
- Set up relationships and indexes
- Generate the Prisma Client for type-safe database queries

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:3000**

### 7. Create Your First Admin User

Use the registration API endpoint to create an admin user:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "name": "Admin User",
    "password": "SecurePassword123!",
    "role": "ADMIN"
  }'
```

## 📁 Project Structure

```
project/
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── projects/       # Project management
│   │   └── risks/          # Risk management
│   ├── dashboard/          # Dashboard pages
│   ├── projects/           # Project pages
│   └── layout.tsx          # Root layout
├── features/               # Feature-based modules (optional)
├── lib/                    # Shared utilities
│   ├── types/             # TypeScript type definitions
│   ├── errors/            # Error handling utilities
│   ├── auth.ts            # Authentication utilities
│   ├── rbac.ts            # Role-based access control
│   ├── middleware.ts      # API middleware
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Helper functions
├── prisma/                # Database schema and migrations
│   └── schema.prisma      # Prisma schema definition
├── public/                # Static assets
├── .env                   # Environment variables (not in git)
├── .env.example          # Environment template
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## 🔐 Authentication & RBAC

### Role Hierarchy and Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **ADMIN** | System Administrator | Full system access, user management |
| **PM** | Project Manager | Create/manage projects, allocate resources |
| **QS** | Quantity Surveyor | Financial management, procurement |
| **SITE** | Site Engineer | Update tasks, log issues and RFIs |
| **VIEWER** | Viewer | Read-only access to all modules |

### Using Authentication in API Calls

Include the JWT token in the Authorization header:

```bash
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 📡 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Project Management

- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project (requires PM or ADMIN)
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Risk Management

- `GET /api/risks?projectId=[id]` - List risks for a project
- `POST /api/risks` - Create new risk
- `PUT /api/risks/[id]` - Update risk
- `DELETE /api/risks/[id]` - Delete risk

For complete API documentation, see [API_REFERENCE.md](./API_REFERENCE.md) (if available).

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint

# Database
npx prisma studio        # Open Prisma Studio (database GUI)
npx prisma migrate dev   # Create and run new migration
npx prisma generate      # Regenerate Prisma Client
npx prisma db push       # Push schema changes without migration
npx prisma db seed       # Seed database with sample data (if configured)

# Utilities
npx prisma format        # Format Prisma schema
```

### Database Migrations

When you make changes to `prisma/schema.prisma`:

```bash
# Create a new migration
npx prisma migrate dev --name description_of_changes

# Apply migrations in production
npx prisma migrate deploy
```

### Adding New Features

1. Create new API routes in `app/api/[feature]/`
2. Add shared types in `lib/types/`
3. Create utilities in `lib/` as needed
4. Update Prisma schema if database changes are required
5. Run migrations and regenerate Prisma Client

## 🧪 Testing

### End-to-End Tests (Playwright)

The project includes comprehensive E2E regression tests covering key user flows:

```bash
# Install test dependencies (if not already installed)
npm install --legacy-peer-deps

# Install Playwright browsers
npx playwright install chromium

# Run all tests
npm run test

# Run tests with interactive UI
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run smoke tests for quick verification
npm run test:smoke

# View test report
npm run test:report
```

**Test Coverage:**
- ✅ Portfolio auth guard (19 tests total)
- ✅ Changes route navigation
- ✅ Project register button navigation
- ✅ Risk export download trigger

See [TESTING.md](./TESTING.md) for detailed test documentation.

### Code Quality

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Test database connection
npx prisma db pull
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
4. Deploy!

### Deploy to Other Platforms

The application can be deployed to:

- **Heroku**: Add PostgreSQL add-on, set environment variables
- **AWS**: Use Elastic Beanstalk, ECS, or Lambda with RDS PostgreSQL
- **DigitalOcean**: App Platform with managed PostgreSQL
- **Railway**: Simple deployment with built-in PostgreSQL
- **Render**: Web service with PostgreSQL database

### Environment Variables for Production

Ensure these are set in your production environment:

```env
DATABASE_URL="postgresql://..."  # Production database URL
JWT_SECRET="..."                  # Secure random string
NODE_ENV="production"
```

## 🔒 Security

- **Authentication**: JWT-based with secure token generation
- **Password Hashing**: bcrypt with salt rounds for password security
- **SQL Injection**: Protected via Prisma's parameterized queries
- **CORS**: Configured for production domains
- **Environment Variables**: Sensitive data stored in .env (not in version control)
- **Role-Based Access**: Granular permissions for each role

For detailed security information, see [SECURITY.md](./SECURITY.md).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is proprietary software for construction project management.

## 🆘 Support

For issues, questions, or support:

- Create an issue in the repository
- Review existing documentation
- Contact the development team

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Real-time collaboration with WebSockets
- [ ] Advanced analytics and ML predictions
- [ ] Integration with construction tools (BIM, CAD)
- [ ] Automated report scheduling
- [ ] Email notifications
- [ ] Document management system

---

Built with ❤️ for the construction industry
