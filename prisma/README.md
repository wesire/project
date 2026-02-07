# Prisma Schema Documentation

This directory contains the Prisma schema and database migrations for the Construction Project Control System.

## Schema Overview

The schema includes comprehensive models for managing construction projects with the following entities:

### Core Entities

1. **User** - System users with role-based access control
2. **Role** - User roles (ADMIN, PM, QS, SITE, VIEWER) defined as an enum
3. **Project** - Project portfolio management
4. **ProjectMember** - Project team membership

### Task Management

5. **Task** - Work items with dependencies
6. **Sprint** - Agile sprint management
7. **Milestone** - Project milestones and deliverables

### Risk & Change Management

8. **Risk** - Risk register with probability × impact scoring
9. **ChangeOrder** - Change log and order management

### Resource Management

10. **Resource** - Resource catalog (labor, equipment, materials, contractors)
11. **ResourceAllocation** - Resource assignments to projects

### Financial Management

12. **Cashflow** - Cash flow forecast vs. actual tracking
13. **BudgetLine** - Budget breakdown by category

### Quality & Communication

14. **Issue** - Issue tracking and resolution
15. **RFI** - Request for Information management
16. **Submittal** - Submittal tracking and review
17. **Procurement** - Purchase orders and vendor management

### Decision & Action Tracking

18. **Decision** - Project decision log
19. **Action** - Action items (can be linked to decisions)

### Supporting Entities

20. **Attachment** - File attachments for various entities
21. **AuditLog** - Complete audit trail of all changes

## Database Setup

### Prerequisites

- PostgreSQL 14.0 or higher
- Node.js 18.0 or higher
- Prisma CLI (installed via npm)

### Initial Setup

1. Create a PostgreSQL database:
```bash
createdb construction_control
```

2. Configure environment variables:
```bash
cp ../.env.example ../.env
# Edit .env and set DATABASE_URL
```

3. Run migrations:
```bash
npx prisma migrate deploy
```

4. Generate Prisma Client:
```bash
npx prisma generate
```

### Development Workflow

When making schema changes:

1. Edit `schema.prisma`
2. Create a new migration:
```bash
npx prisma migrate dev --name description_of_changes
```
3. The Prisma Client will be automatically regenerated

### Viewing the Database

Use Prisma Studio to view and edit data:
```bash
npx prisma studio
```

## Schema Relationships

### Project Relationships

A Project has:
- Many members (ProjectMember)
- Many tasks
- Many sprints
- Many milestones
- Many risks
- Many change orders
- Many issues
- Many RFIs
- Many submittals
- Many decisions
- Many actions
- Many procurement orders
- Many resource allocations
- Many cashflows
- Many budget lines
- Many attachments
- Many audit logs

### Task Relationships

A Task can be:
- Assigned to a Sprint (optional)
- Assigned to a Milestone (optional)
- Assigned to a User (optional)
- Created by a User
- Have dependencies on other tasks

### Resource Relationships

- Resources can be allocated to projects via ResourceAllocation
- ResourceAllocation links Users, Resources, and Projects

### Decision & Action Flow

- Decisions can have multiple Actions
- Actions can be assigned to Users
- Actions track completion status and due dates

### Attachment System

Attachments are polymorphic and can be linked to various entities using:
- `entityType` - The type of entity (e.g., "Project", "Task", "RFI", "Submittal")
- `entityId` - The ID of the specific entity instance

## Migrations

### Migration History

- `20260207230024_init` - Initial schema with all 21 models

### Running Migrations

In development:
```bash
npx prisma migrate dev
```

In production:
```bash
npx prisma migrate deploy
```

### Resetting the Database

⚠️ This will delete all data:
```bash
npx prisma migrate reset
```

## Seeding

To populate the database with sample data:
```bash
npx prisma db seed
```

See `seed.ts` for seed data configuration.

## Performance Considerations

### Indexes

The schema includes the following unique indexes for performance:
- User email
- Project number
- Unique project-specific numbers for: risks, change orders, tasks, issues, RFIs, decisions, actions, submittals, procurements
- Unique combinations: (projectId, userId) for ProjectMember

### Query Optimization Tips

1. Always use `select` to limit fields returned
2. Use `include` judiciously - only include relations you need
3. Consider using `findUnique` instead of `findFirst` when possible
4. Use cursor-based pagination for large datasets

## Security

### Cascade Deletes

Most relations use `onDelete: Cascade` to ensure data integrity when projects are deleted.

### Sensitive Data

- User passwords are stored as hashed values (`passwordHash`)
- Never query or expose password hashes in API responses
- Use the authentication utilities in `lib/auth.ts`

## Type Safety

The Prisma Client provides full TypeScript type safety:

```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Fully typed query
const project = await prisma.project.findUnique({
  where: { id: 'some-id' },
  include: {
    tasks: true,
    risks: true,
  }
})
```

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
