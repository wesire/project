# Database Schema Diagram

## Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Construction Project Control System                  │
│                              Database Schema (ERD)                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│     USER     │
├──────────────┤
│ id           │◄─────┐
│ email (uniq) │      │
│ name         │      │
│ passwordHash │      │
│ role (enum)  │      │
└──────────────┘      │
      ▲               │
      │               │
      │ createdBy     │
      │               │
┌─────┴──────────────────────────────────────────────────────────────────────┐
│                              PROJECT                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│ id                    projectNumber (unique)      status (enum)             │
│ name                  description                 budget                    │
│ startDate             endDate                     actualCost                │
│ currency              location                    client                    │
│ createdById ──────────────────────────────────────────────────────────────► │
└──────────────────────────────────────────────────────────────────────────────┘
    │         │         │         │         │         │         │         │
    │         │         │         │         │         │         │         │
    ▼         ▼         ▼         ▼         ▼         ▼         ▼         ▼
┌───────┐ ┌────┐ ┌────────┐ ┌──────────┐ ┌──────┐ ┌──────────┐ ┌──────┐ ┌──────────┐
│Project│ │Task│ │Sprint  │ │Milestone │ │Risk  │ │ChangeOrder│ │Issue │ │RFI       │
│Member │ └────┘ └────────┘ └──────────┘ └──────┘ └──────────┘ └──────┘ └──────────┘
└───────┘
    │         ▼         ▼         ▼         ▼         ▼         ▼         ▼
    ▼     ┌──────────────────────────────────────────────────────────────┐
┌─────┐   │        Additional Project-Related Entities:                   │
│User │   │  - Decision        - Action         - Submittal              │
└─────┘   │  - Procurement     - BudgetLine     - Cashflow               │
          │  - ResourceAlloc   - Attachment     - AuditLog               │
          └──────────────────────────────────────────────────────────────┘
```

## Detailed Entity Relationships

### 1. User & Authentication
```
User (1) ──────────────── (*) ProjectMember
User (1) ──── creates ──── (*) Project
User (1) ──── creates ──── (*) Task
User (1) ── assigned to ── (*) Task
User (1) ──── raises ───── (*) Issue
User (1) ─── requests ──── (*) RFI
User (1) ── assigned to ── (*) Action
User (1) ─── allocates ─── (*) ResourceAllocation
User (1) ──── uploads ──── (*) Attachment
User (1) ─── performs ──── (*) AuditLog
```

### 2. Project Core
```
Project (1) ───────────── (*) ProjectMember ───────────── (1) User
Project (1) ───────────── (*) Task
Project (1) ───────────── (*) Sprint ───────────────────── (*) Task
Project (1) ───────────── (*) Milestone ─────────────────── (*) Task
```

### 3. Risk & Change Management
```
Project (1) ───────────── (*) Risk
Project (1) ───────────── (*) ChangeOrder
```

### 4. Task Management
```
Project (1) ───────────── (*) Task
Sprint (1) ────────────── (*) Task
Milestone (1) ─────────── (*) Task
User (1) ──── creates ──── (*) Task
User (1) ─── assigned ──── (*) Task
```

### 5. Resource Management
```
Project (1) ───────────── (*) ResourceAllocation
User (1) ─────────────────── (*) ResourceAllocation
Resource (1) ──────────────── (*) ResourceAllocation
```

### 6. Financial Management
```
Project (1) ───────────── (*) Cashflow
Project (1) ───────────── (*) BudgetLine
```

### 7. Quality & Communication
```
Project (1) ───────────── (*) Issue ──────────────────── (1) User (raisedBy)
Project (1) ───────────── (*) RFI ────────────────────── (1) User (requestedBy)
Project (1) ───────────── (*) Submittal ───────────────── (*) Attachment
Project (1) ───────────── (*) Procurement
```

### 8. Decision & Action Flow
```
Project (1) ───────────── (*) Decision ───────────────── (*) Action
Action (1) ────────────────── (0..1) User (assignedTo)
```

### 9. Supporting Systems
```
Project (1) ───────────── (*) Attachment ───────────────── (1) User (uploadedBy)
Project (1) ───────────── (*) AuditLog ─────────────────── (1) User
Submittal (1) ─────────────── (*) Attachment (polymorphic)
```

## Key Entity Details

### User
- **Primary Key:** id (cuid)
- **Unique:** email
- **Role Types:** ADMIN, PM, QS, SITE, VIEWER
- **Relationships:** Creates projects, tasks; assigned to tasks, actions; raises issues, RFIs

### Project
- **Primary Key:** id (cuid)
- **Unique:** projectNumber
- **Status Types:** PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED
- **Relationships:** Central entity connecting all modules

### Task
- **Primary Key:** id (cuid)
- **Unique:** (projectId, taskNumber)
- **Status:** TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED
- **Dependencies:** Array of task IDs
- **Relationships:** Belongs to project, sprint (optional), milestone (optional)

### Milestone
- **Primary Key:** id (cuid)
- **Status:** PENDING, IN_PROGRESS, COMPLETED, DELAYED
- **Relationships:** Belongs to project, has many tasks

### Sprint
- **Primary Key:** id (cuid)
- **Status:** PLANNED, ACTIVE, COMPLETED, CANCELLED
- **Relationships:** Belongs to project, has many tasks

### Risk
- **Primary Key:** id (cuid)
- **Unique:** (projectId, riskNumber)
- **Scoring:** probability (1-5) × impact (1-5) = score
- **Status:** OPEN, MITIGATED, CLOSED, ACCEPTED

### ChangeOrder
- **Primary Key:** id (cuid)
- **Unique:** (projectId, changeNumber)
- **Status:** SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, IMPLEMENTED
- **Impacts:** costImpact (Float), timeImpact (Int days)

### Resource
- **Primary Key:** id (cuid)
- **Types:** LABOR, EQUIPMENT, MATERIAL, CONTRACTOR
- **Relationships:** Allocated to projects via ResourceAllocation

### ResourceAllocation
- **Primary Key:** id (cuid)
- **Relationships:** Links User, Resource, and Project

### BudgetLine
- **Primary Key:** id (cuid)
- **Tracks:** budgeted, spent, committed, variance

### Cashflow
- **Primary Key:** id (cuid)
- **Types:** INFLOW, OUTFLOW
- **Tracks:** forecast, actual, variance

### Issue
- **Primary Key:** id (cuid)
- **Unique:** (projectId, issueNumber)
- **Status:** OPEN, IN_PROGRESS, RESOLVED, CLOSED
- **Priority:** LOW, MEDIUM, HIGH, CRITICAL

### Decision
- **Primary Key:** id (cuid)
- **Unique:** (projectId, decisionNumber)
- **Status:** PENDING, APPROVED, REJECTED, DEFERRED
- **Relationships:** Has many actions

### Action
- **Primary Key:** id (cuid)
- **Unique:** (projectId, actionNumber)
- **Status:** OPEN, IN_PROGRESS, COMPLETED, CANCELLED, OVERDUE
- **Relationships:** Belongs to decision (optional), assigned to user

### RFI (Request for Information)
- **Primary Key:** id (cuid)
- **Unique:** (projectId, rfiNumber)
- **Status:** OPEN, RESPONDED, CLOSED

### Submittal
- **Primary Key:** id (cuid)
- **Unique:** (projectId, submittalNumber)
- **Status:** DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, APPROVED_WITH_COMMENTS, REJECTED, RESUBMIT
- **Types:** Shop Drawings, Product Data, Samples

### Procurement
- **Primary Key:** id (cuid)
- **Unique:** (projectId, poNumber)
- **Status:** REQUESTED, APPROVED, ORDERED, DELIVERED, INVOICED, PAID

### Attachment
- **Primary Key:** id (cuid)
- **Polymorphic:** entityType + entityId (links to various entities)
- **Tracks:** fileName, fileSize, fileType, filePath

### AuditLog
- **Primary Key:** id (cuid)
- **Tracks:** action, entityType, entityId, changes (JSON)
- **Purpose:** Complete audit trail of all changes

## Cascade Delete Behavior

Most relationships use `onDelete: Cascade` to maintain data integrity:
- When a **Project** is deleted, all related entities are also deleted
- When a **User** is deleted, their relationships are handled appropriately
- Some relations use `SET NULL` or `RESTRICT` where appropriate

## Indexes

Unique indexes are created for:
- User.email
- Project.projectNumber
- (projectId, taskNumber), (projectId, riskNumber), etc.
- (projectId, userId) for ProjectMember

These ensure data integrity and improve query performance.
