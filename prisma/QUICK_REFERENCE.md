# Quick Reference Guide - Prisma Schema

## At a Glance

### Stats
- **Total Models:** 20
- **Total Enums:** 16  
- **Migration Size:** 19KB (542 lines of SQL)
- **Schema Lines:** 588
- **Documentation:** 21KB across 4 files

### What's New (7 Models)

| Model | Purpose | Key Features |
|-------|---------|--------------|
| **Milestone** | Track project deliverables | Status tracking, progress %, links to tasks |
| **Resource** | Resource catalog | Types: LABOR, EQUIPMENT, MATERIAL, CONTRACTOR |
| **BudgetLine** | Budget by category | Tracks budgeted/spent/committed/variance |
| **Decision** | Decision log | Status workflow, links to multiple actions |
| **Action** | Action items | Can link to decisions, assigned to users |
| **Submittal** | Submittal workflow | Review status, links to attachments |
| **Attachment** | File attachments | Polymorphic - links to any entity |

## Quick Start

### 1. Setup Database (First Time)
```bash
# Create PostgreSQL database
createdb construction_control

# Configure .env
DATABASE_URL="postgresql://user:pass@localhost:5432/construction_control"

# Run migration
npx prisma migrate deploy

# Generate client
npx prisma generate

# Seed data (optional)
npx prisma db seed
```

### 2. Use in Code
```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Example: Get project with all related entities
const project = await prisma.project.findUnique({
  where: { id: projectId },
  include: {
    tasks: true,
    milestones: true,
    risks: true,
    decisions: { include: { actions: true } },
    submittals: { include: { attachments: true } },
  }
})
```

## Model Relationships Quick Reference

### Core Flow
```
User → creates → Project
Project → has many → [Tasks, Milestones, Sprints, ...]
Task → belongs to → Sprint (optional)
Task → belongs to → Milestone (optional)
Decision → has many → Actions
Submittal → has many → Attachments
```

### Resource Flow
```
Resource → allocated via → ResourceAllocation
ResourceAllocation → links → [User, Resource, Project]
```

### Financial Flow
```
Project → has many → BudgetLine (budgeting)
Project → has many → Cashflow (cash management)
Project → has many → Procurement (purchasing)
```

## Common Queries

### Get All Project Data
```typescript
const projectFull = await prisma.project.findUnique({
  where: { projectNumber: 'PRJ-001' },
  include: {
    members: { include: { user: true } },
    tasks: { include: { assignedTo: true, sprint: true } },
    milestones: { include: { tasks: true } },
    sprints: { include: { tasks: true } },
    risks: true,
    changes: true,
    issues: true,
    rfis: true,
    decisions: { include: { actions: true } },
    submittals: { include: { attachments: true } },
    procurements: true,
    budgetLines: true,
    cashflows: true,
    resources: true,
  }
})
```

### Create Task with Relationships
```typescript
const task = await prisma.task.create({
  data: {
    projectId: project.id,
    sprintId: sprint.id,
    milestoneId: milestone.id,
    taskNumber: 'TASK-001',
    title: 'Complete foundation work',
    status: 'TODO',
    priority: 'HIGH',
    createdById: userId,
    assignedToId: assigneeId,
    estimatedHours: 40,
  }
})
```

### Decision with Actions
```typescript
const decision = await prisma.decision.create({
  data: {
    projectId: project.id,
    decisionNumber: 'DEC-001',
    title: 'Approve design change',
    status: 'PENDING',
    actions: {
      create: [
        {
          projectId: project.id,
          actionNumber: 'ACT-001',
          title: 'Review design',
          status: 'OPEN',
          assignedToId: userId,
        }
      ]
    }
  },
  include: { actions: true }
})
```

### Submittal with Attachments
```typescript
const submittal = await prisma.submittal.create({
  data: {
    projectId: project.id,
    submittalNumber: 'SUB-001',
    title: 'Concrete mix design',
    type: 'Product Data',
    status: 'DRAFT',
    attachments: {
      create: [
        {
          projectId: project.id,
          entityType: 'Submittal',
          fileName: 'design.pdf',
          fileSize: 1024000,
          fileType: 'application/pdf',
          filePath: '/uploads/design.pdf',
          uploadedById: userId,
        }
      ]
    }
  },
  include: { attachments: true }
})
```

## Status Enums Reference

### Project Status
- PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED

### Task Status
- TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED

### Milestone Status
- PENDING, IN_PROGRESS, COMPLETED, DELAYED

### Decision Status
- PENDING, APPROVED, REJECTED, DEFERRED

### Action Status
- OPEN, IN_PROGRESS, COMPLETED, CANCELLED, OVERDUE

### Submittal Status
- DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, APPROVED_WITH_COMMENTS, REJECTED, RESUBMIT

### Issue Status
- OPEN, IN_PROGRESS, RESOLVED, CLOSED

### RFI Status
- OPEN, RESPONDED, CLOSED

### Priority (Tasks/Issues/Actions/Decisions)
- LOW, MEDIUM, HIGH, CRITICAL

## Useful Commands

### Database Management
```bash
# View database in browser
npx prisma studio

# Create new migration
npx prisma migrate dev --name description

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate types after schema change
npx prisma generate

# Format schema
npx prisma format

# Validate schema
npx prisma validate
```

### Development
```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Run dev server
npm run dev
```

## Security Notes

🔒 **Password Security**
- User passwords stored as `passwordHash` (bcrypt)
- Never expose password hashes in API responses

🔒 **Cascade Deletes**
- Deleting a Project cascades to all related entities
- Use with caution in production

🔒 **Audit Trail**
- All changes tracked in AuditLog
- Includes before/after snapshots in JSON

## Performance Tips

⚡ **Query Optimization**
1. Use `select` to limit fields
2. Use `include` sparingly
3. Use `findUnique` over `findFirst` when possible
4. Implement cursor-based pagination for large datasets

⚡ **Indexes**
- Unique indexes on email, projectNumber, etc.
- Composite indexes on (projectId, entityNumber)
- Foreign key indexes automatic

## Next Steps

### For Backend Development
1. ✅ Schema complete
2. ⏭️ Create API routes for new entities
3. ⏭️ Add validation with Zod schemas
4. ⏭️ Implement RBAC checks
5. ⏭️ Add API tests

### For Frontend Development
1. ⏭️ Milestone management UI
2. ⏭️ Resource allocation interface
3. ⏭️ Budget tracking dashboard
4. ⏭️ Decision/action management
5. ⏭️ Submittal workflow
6. ⏭️ Attachment upload/display

## Support

📖 **Documentation**
- prisma/README.md - Comprehensive guide
- prisma/SCHEMA_DIAGRAM.md - Visual ERD
- prisma/IMPLEMENTATION_SUMMARY.md - Implementation details

🔗 **External Resources**
- [Prisma Docs](https://www.prisma.io/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

---

**Version:** 1.0.0 (Initial Implementation)  
**Last Updated:** February 7, 2026  
**Status:** ✅ Production Ready
