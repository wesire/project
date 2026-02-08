# API Routes Summary

This document summarizes the complete CRUD API routes created for the Construction Project Control system.

## Created API Routes

### 1. Changes (ChangeOrder) API
- **Path**: `/api/changes`
- **Project-scoped**: Yes
- **Permissions**: `change:create`, `change:read`, `change:update`, `change:delete`
- **Features**:
  - List with pagination, sorting, filtering, search
  - Create new change orders with cost and time impact
  - Get by ID with project details
  - Update change orders
  - Delete change orders
  - Audit logging for all mutations

### 2. Tasks API
- **Path**: `/api/tasks`
- **Project-scoped**: Yes
- **Permissions**: `task:create`, `task:read`, `task:update`, `task:delete`
- **Features**:
  - List with pagination, sorting, filtering, search
  - Create tasks with sprint assignment and dependencies
  - Get by ID with sprint, milestone, assignee, and creator details
  - Update tasks including status, priority, and progress
  - Delete tasks
  - Audit logging for all mutations
  - Support for task dependencies array

### 3. Sprints API
- **Path**: `/api/sprints`
- **Project-scoped**: Yes
- **Permissions**: `sprint:create`, `sprint:read`, `sprint:update`, `sprint:delete`
- **Features**:
  - List with pagination, sorting, filtering, search
  - Create sprints with goals and date ranges
  - Get by ID with associated tasks
  - Update sprints
  - Delete sprints
  - Audit logging for all mutations
  - Task count in list view

### 4. Resources API
- **Path**: `/api/resources`
- **Project-scoped**: No (Global)
- **Permissions**: `resource:create`, `resource:read`, `resource:update`, `resource:delete`
- **Features**:
  - List with pagination, sorting, filtering, search
  - Create resources with type, cost per hour, and skills
  - Get by ID with allocation history
  - Update resources
  - Delete resources
  - Audit logging for all mutations (no projectId)
  - Allocation count in list view

### 5. Allocations (ResourceAllocation) API
- **Path**: `/api/allocations`
- **Project-scoped**: Yes
- **Permissions**: `allocation:create`, `allocation:read`, `allocation:update`, `allocation:delete`
- **Features**:
  - List with pagination, sorting, filtering, search
  - Create resource allocations with hours and utilization
  - Get by ID with project, user, and resource details
  - Update allocations
  - Delete allocations
  - Audit logging for all mutations

### 6. Cashflows API
- **Path**: `/api/cashflows`
- **Project-scoped**: Yes
- **Permissions**: `cashflow:create`, `cashflow:read`, `cashflow:update`, `cashflow:delete`
- **Features**:
  - List with pagination, sorting, filtering, search
  - Create cashflows with forecast and actual amounts
  - Get by ID with project details
  - Update cashflows with automatic variance calculation
  - Delete cashflows
  - Audit logging for all mutations
  - Automatic variance calculation (actual - forecast)

## Common Features Across All APIs

### Authentication & Authorization
- All routes require authentication via `authenticateRequest` or `requirePermission`
- Project-scoped routes check project access via `requireProjectPermission`
- Resources API uses global permissions without project filtering

### Pagination & Querying
All GET list endpoints support:
- **Pagination**: `?page=1&perPage=30` (max 100 per page)
- **Sorting**: `?sortBy=field1,field2&sortOrder=asc,desc`
- **Search**: `?search=query&searchFields=field1,field2`
- **Filtering**: `?status=ACTIVE&priority=HIGH`
- **Range filters**: `?startDate_gte=2024-01-01&endDate_lte=2024-12-31`

### Data Validation
- Input validation using Zod schemas from `@/lib/validation`
- Appropriate error messages for validation failures
- Type-safe request/response handling

### Error Handling
All routes handle:
- **401**: Authentication errors
- **403**: Authorization errors
- **404**: Not found errors
- **400**: Validation errors
- **500**: Internal server errors

### Audit Logging
All CREATE, UPDATE, and DELETE operations create audit log entries with:
- User ID
- Action type (CREATE, UPDATE, DELETE)
- Entity type and ID
- Before/after snapshots for updates
- Project ID (where applicable)

### Relations & Includes
GET operations include relevant relations:
- Project details (name, projectNumber)
- User details (name, email) for assignees, creators
- Related entities (sprint, milestone, resource)
- Count aggregations where appropriate

## Security Features

1. **Authentication**: All routes require valid authentication
2. **Authorization**: Role-based permissions checked before operations
3. **Project Scoping**: Project-scoped entities enforce project membership
4. **Input Validation**: All inputs validated with Zod schemas
5. **SQL Injection Prevention**: Using Prisma ORM with parameterized queries
6. **Error Handling**: Consistent error responses without leaking sensitive data

## API Response Formats

### List Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "perPage": 30,
    "total": 100,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Single Item Response
```json
{
  "id": "...",
  "field1": "...",
  "field2": "...",
  "project": { "id": "...", "name": "...", "projectNumber": "..." },
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional details (for validation errors)"
}
```

## TypeScript Fixes

Fixed TypeScript error handling in existing API routes:
- `app/api/projects/route.ts`
- `app/api/projects/[id]/route.ts`
- `app/api/risks/route.ts`
- `app/api/risks/[id]/route.ts`

Changed error type checks from:
```typescript
if (error instanceof ValidationError || error.name === 'ZodError')
```

To:
```typescript
if (error instanceof ValidationError || (error as any).name === 'ZodError')
```

This fixes TypeScript's "error is of type 'unknown'" compilation errors.
