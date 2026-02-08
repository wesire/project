# CRUD API Documentation

This document provides comprehensive documentation for all CRUD API endpoints in the Construction Project Control system.

## Table of Contents

- [Authentication](#authentication)
- [Common Features](#common-features)
- [Projects API](#projects-api)
- [Risks API](#risks-api)
- [Changes API](#changes-api)
- [Tasks API](#tasks-api)
- [Sprints API](#sprints-api)
- [Resources API](#resources-api)
- [Allocations API](#allocations-api)
- [Cashflows API](#cashflows-api)

## Authentication

All API endpoints (except auth endpoints) require authentication using JWT tokens.

**Request Header:**
```
Authorization: Bearer <your_jwt_token>
```

**Response Codes:**
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions

## Common Features

### Pagination

All list endpoints support pagination using query parameters:

- `page` - Page number (default: 1, min: 1)
- `perPage` - Results per page (default: 30, min: 1, max: 100)

**Example:**
```
GET /api/projects?page=2&perPage=50
```

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "perPage": 50,
    "total": 156,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

### Sorting

All list endpoints support sorting using query parameters:

- `sortBy` - Field name(s) to sort by (comma-separated for multiple fields)
- `sortOrder` - Sort order: `asc` or `desc` (comma-separated for multiple fields)

**Example:**
```
GET /api/projects?sortBy=name&sortOrder=asc
GET /api/projects?sortBy=status,createdAt&sortOrder=desc,asc
```

### Filtering

All list endpoints support filtering using query parameters. Supports exact match and range operators.

**Exact Match:**
```
GET /api/projects?status=ACTIVE&client=ABC Corp
```

**Range Operators:**
- `field_gte` - Greater than or equal
- `field_lte` - Less than or equal
- `field_gt` - Greater than
- `field_lt` - Less than

**Example:**
```
GET /api/tasks?priority=HIGH&estimatedHours_gte=10
GET /api/cashflows?date_gte=2024-01-01&date_lte=2024-12-31
```

### Search

All list endpoints support text search across multiple fields:

- `search` - Search query text
- `searchFields` - Comma-separated list of fields to search (optional)

**Example:**
```
GET /api/projects?search=construction
GET /api/risks?search=safety&searchFields=title,description,mitigation
```

### Project-Scoped Permissions

Most endpoints are project-scoped:
- **Admins and PMs** have access to all projects
- **Other users** can only access projects they are members of

**Project-Scoped Endpoints:**
- Projects, Risks, Changes, Tasks, Sprints, Allocations, Cashflows

**Non-Project-Scoped Endpoints:**
- Resources (system-wide)

---

## Projects API

### List Projects

**Endpoint:** `GET /api/projects`

**Permission Required:** `project:read`

**Query Parameters:**
- Pagination: `page`, `perPage`
- Sorting: `sortBy` (projectNumber, name, status, startDate, endDate, budget, createdAt, updatedAt)
- Search: `search`, `searchFields` (projectNumber, name, description, client, location)
- Filters: `status`, `currency`, `client`, `location`

**Example Request:**
```bash
curl -H "Authorization: Bearer <token>" \
  "https://api.example.com/api/projects?page=1&perPage=30&status=ACTIVE&sortBy=name&sortOrder=asc"
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "clxxx...",
      "projectNumber": "P2024-001",
      "name": "Construction Project Alpha",
      "description": "New office building",
      "status": "ACTIVE",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T00:00:00.000Z",
      "budget": 1500000,
      "actualCost": 450000,
      "currency": "GBP",
      "location": "London",
      "client": "ABC Corp",
      "createdBy": {
        "id": "clyyy...",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "members": [...],
      "_count": {
        "risks": 15,
        "changes": 3,
        "tasks": 87,
        "issues": 5
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 30,
    "total": 45,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Create Project

**Endpoint:** `POST /api/projects`

**Permission Required:** `project:create`

**Request Body:**
```json
{
  "projectNumber": "P2024-002",
  "name": "New Construction Project",
  "description": "Optional description",
  "status": "PLANNING",
  "startDate": "2024-03-01T00:00:00.000Z",
  "endDate": "2025-02-28T00:00:00.000Z",
  "budget": 2000000,
  "currency": "GBP",
  "location": "Manchester",
  "client": "XYZ Limited"
}
```

**Response:** `201 Created` with created project object

### Get Project by ID

**Endpoint:** `GET /api/projects/{id}`

**Permission Required:** `project:read` + project access

**Response:** Project object with full details

### Update Project

**Endpoint:** `PUT /api/projects/{id}`

**Permission Required:** `project:update` + project access

**Request Body:** Partial project object (only fields to update)

**Response:** Updated project object

### Delete Project

**Endpoint:** `DELETE /api/projects/{id}`

**Permission Required:** `project:delete` + project access

**Response:** `200 OK` with success message

**Note:** This will cascade delete all related records (risks, tasks, etc.)

---

## Risks API

### List Risks

**Endpoint:** `GET /api/risks`

**Permission Required:** `risk:read`

**Query Parameters:**
- Pagination: `page`, `perPage`
- Sorting: `sortBy` (riskNumber, title, category, probability, impact, score, status, createdAt, updatedAt)
- Search: `search`, `searchFields` (riskNumber, title, description, category, owner, mitigation)
- Filters: `projectId`, `status`, `category`, `owner`

**Default Sort:** `score` (descending)

**Example Request:**
```bash
curl -H "Authorization: Bearer <token>" \
  "https://api.example.com/api/risks?projectId=clxxx...&status=OPEN&sortBy=score&sortOrder=desc"
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "clzzz...",
      "projectId": "clxxx...",
      "riskNumber": "R-001",
      "title": "Weather delay risk",
      "description": "Potential delays due to adverse weather conditions",
      "category": "Environmental",
      "probability": 4,
      "impact": 3,
      "score": 12,
      "status": "OPEN",
      "owner": "Jane Smith",
      "mitigation": "Monitor weather forecasts and adjust schedule",
      "contingency": "Add 2 weeks buffer to timeline",
      "project": {
        "id": "clxxx...",
        "name": "Construction Project Alpha",
        "projectNumber": "P2024-001"
      },
      "createdAt": "2024-01-05T00:00:00.000Z",
      "updatedAt": "2024-01-10T00:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

### Create Risk

**Endpoint:** `POST /api/risks`

**Permission Required:** `risk:create` + project access

**Request Body:**
```json
{
  "projectId": "clxxx...",
  "riskNumber": "R-002",
  "title": "Supply chain disruption",
  "description": "Risk of material delivery delays",
  "category": "Procurement",
  "probability": 3,
  "impact": 4,
  "owner": "John Doe",
  "mitigation": "Identify alternative suppliers",
  "contingency": "Maintain 2-week material inventory"
}
```

**Note:** `score` is automatically calculated as `probability × impact`

**Response:** `201 Created` with created risk object

### Get Risk by ID

**Endpoint:** `GET /api/risks/{id}`

**Permission Required:** `risk:read` + project access

### Update Risk

**Endpoint:** `PUT /api/risks/{id}`

**Permission Required:** `risk:update` + project access

**Note:** `score` is automatically recalculated if `probability` or `impact` changes

### Delete Risk

**Endpoint:** `DELETE /api/risks/{id}`

**Permission Required:** `risk:delete` + project access

---

## Changes API

### List Changes

**Endpoint:** `GET /api/changes`

**Permission Required:** `change:read`

**Query Parameters:**
- Pagination: `page`, `perPage`
- Sorting: `sortBy` (changeNumber, title, status, costImpact, timeImpact, submittedDate, createdAt, updatedAt)
- Search: `search`, `searchFields` (changeNumber, title, description, requestedBy)
- Filters: `projectId`, `status`, `requestedBy`

**Example Response:**
```json
{
  "data": [
    {
      "id": "claaa...",
      "projectId": "clxxx...",
      "changeNumber": "CH-001",
      "title": "Add extra parking spaces",
      "description": "Client requested 20 additional parking spaces",
      "status": "APPROVED",
      "requestedBy": "Client - ABC Corp",
      "approvedBy": "Project Manager",
      "costImpact": 45000,
      "timeImpact": 14,
      "submittedDate": "2024-02-01T00:00:00.000Z",
      "approvedDate": "2024-02-05T00:00:00.000Z",
      "implementedDate": null,
      "project": {
        "id": "clxxx...",
        "name": "Construction Project Alpha",
        "projectNumber": "P2024-001"
      },
      "createdAt": "2024-02-01T00:00:00.000Z",
      "updatedAt": "2024-02-05T00:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

### Create Change

**Endpoint:** `POST /api/changes`

**Permission Required:** `change:create` + project access

**Request Body:**
```json
{
  "projectId": "clxxx...",
  "changeNumber": "CH-002",
  "title": "Upgrade HVAC system",
  "description": "Replace standard HVAC with energy-efficient system",
  "requestedBy": "Sustainability Consultant",
  "costImpact": 75000,
  "timeImpact": 7
}
```

### Get, Update, Delete Change

Similar patterns to Projects and Risks APIs.

---

## Tasks API

### List Tasks

**Endpoint:** `GET /api/tasks`

**Permission Required:** `task:read`

**Query Parameters:**
- Pagination: `page`, `perPage`
- Sorting: `sortBy` (taskNumber, title, status, priority, progress, estimatedHours, actualHours, startDate, endDate, createdAt, updatedAt)
- Search: `search`, `searchFields` (taskNumber, title, description)
- Filters: `projectId`, `sprintId`, `status`, `priority`, `assignedToId`

**Example Response:**
```json
{
  "data": [
    {
      "id": "clbbb...",
      "projectId": "clxxx...",
      "sprintId": "clccc...",
      "milestoneId": null,
      "taskNumber": "T-001",
      "title": "Foundation excavation",
      "description": "Excavate and prepare foundation",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "estimatedHours": 80,
      "actualHours": 45,
      "progress": 60,
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-01-30T00:00:00.000Z",
      "dependencies": [],
      "project": {...},
      "sprint": {...},
      "assignedTo": {
        "id": "clyyy...",
        "name": "John Smith",
        "email": "john.smith@example.com"
      },
      "createdBy": {...},
      "createdAt": "2024-01-10T00:00:00.000Z",
      "updatedAt": "2024-01-20T00:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

### Create Task

**Endpoint:** `POST /api/tasks`

**Permission Required:** `task:create` + project access

**Request Body:**
```json
{
  "projectId": "clxxx...",
  "sprintId": "clccc...",
  "taskNumber": "T-002",
  "title": "Install steel framework",
  "description": "Install primary steel support structure",
  "status": "TODO",
  "priority": "HIGH",
  "assignedToId": "clyyy...",
  "estimatedHours": 120,
  "startDate": "2024-02-01T00:00:00.000Z",
  "endDate": "2024-02-15T00:00:00.000Z",
  "dependencies": ["clbbb..."]
}
```

### Get, Update, Delete Task

Similar patterns to previous APIs.

---

## Sprints API

### List Sprints

**Endpoint:** `GET /api/sprints`

**Permission Required:** `sprint:read`

**Query Parameters:**
- Pagination: `page`, `perPage`
- Sorting: `sortBy` (name, startDate, endDate, status, createdAt, updatedAt)
- Search: `search`, `searchFields` (name, goal)
- Filters: `projectId`, `status`

**Example Response:**
```json
{
  "data": [
    {
      "id": "clccc...",
      "projectId": "clxxx...",
      "name": "Sprint 1 - Foundation Phase",
      "goal": "Complete foundation work",
      "startDate": "2024-01-15T00:00:00.000Z",
      "endDate": "2024-02-15T00:00:00.000Z",
      "status": "ACTIVE",
      "project": {...},
      "_count": {
        "tasks": 15
      },
      "createdAt": "2024-01-10T00:00:00.000Z",
      "updatedAt": "2024-01-20T00:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

### Create Sprint

**Endpoint:** `POST /api/sprints`

**Permission Required:** `sprint:create` + project access

**Request Body:**
```json
{
  "projectId": "clxxx...",
  "name": "Sprint 2 - Structural Phase",
  "goal": "Complete structural framework",
  "startDate": "2024-02-16T00:00:00.000Z",
  "endDate": "2024-03-31T00:00:00.000Z"
}
```

### Get, Update, Delete Sprint

Similar patterns to previous APIs.

---

## Resources API

### List Resources

**Endpoint:** `GET /api/resources`

**Permission Required:** `resource:read`

**Query Parameters:**
- Pagination: `page`, `perPage`
- Sorting: `sortBy` (name, type, costPerHour, createdAt, updatedAt)
- Search: `search`, `searchFields` (name, description, availability)
- Filters: `type`, `availability`

**Note:** Resources are NOT project-scoped. All authenticated users can view all resources.

**Example Response:**
```json
{
  "data": [
    {
      "id": "clddd...",
      "name": "John Smith",
      "type": "LABOR",
      "description": "Senior Construction Engineer",
      "costPerHour": 75,
      "availability": "Full-time",
      "skills": ["structural", "concrete", "steel"],
      "_count": {
        "allocations": 3
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

### Create Resource

**Endpoint:** `POST /api/resources`

**Permission Required:** `resource:create`

**Request Body:**
```json
{
  "name": "Excavator - CAT 320",
  "type": "EQUIPMENT",
  "description": "Heavy-duty excavator",
  "costPerHour": 125,
  "availability": "On-demand",
  "skills": ["excavation", "earthwork"]
}
```

**Resource Types:**
- `LABOR` - Human resources
- `EQUIPMENT` - Machinery and equipment
- `MATERIAL` - Construction materials
- `CONTRACTOR` - External contractors

### Get, Update, Delete Resource

Similar patterns, no project access check required.

---

## Allocations API

### List Allocations

**Endpoint:** `GET /api/allocations`

**Permission Required:** `allocation:read`

**Query Parameters:**
- Pagination: `page`, `perPage`
- Sorting: `sortBy` (resourceType, allocatedHours, utilization, startDate, endDate, createdAt, updatedAt)
- Search: `search`, `searchFields` (resourceType)
- Filters: `projectId`, `userId`, `resourceId`, `resourceType`

**Example Response:**
```json
{
  "data": [
    {
      "id": "cleee...",
      "projectId": "clxxx...",
      "userId": "clyyy...",
      "resourceId": "clddd...",
      "resourceType": "LABOR",
      "allocatedHours": 160,
      "utilization": 75,
      "startDate": "2024-02-01T00:00:00.000Z",
      "endDate": "2024-02-29T00:00:00.000Z",
      "project": {...},
      "user": {...},
      "resource": {...},
      "createdAt": "2024-01-25T00:00:00.000Z",
      "updatedAt": "2024-02-15T00:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

### Create Allocation

**Endpoint:** `POST /api/allocations`

**Permission Required:** `allocation:create` + project access

**Request Body:**
```json
{
  "projectId": "clxxx...",
  "userId": "clyyy...",
  "resourceId": "clddd...",
  "resourceType": "LABOR",
  "allocatedHours": 160,
  "utilization": 80,
  "startDate": "2024-03-01T00:00:00.000Z",
  "endDate": "2024-03-31T00:00:00.000Z"
}
```

### Get, Update, Delete Allocation

Similar patterns to previous APIs.

---

## Cashflows API

### List Cashflows

**Endpoint:** `GET /api/cashflows`

**Permission Required:** `cashflow:read`

**Query Parameters:**
- Pagination: `page`, `perPage`
- Sorting: `sortBy` (date, type, category, forecast, actual, variance, createdAt, updatedAt)
- Search: `search`, `searchFields` (category, description)
- Filters: `projectId`, `type`, `category`

**Example Response:**
```json
{
  "data": [
    {
      "id": "clfff...",
      "projectId": "clxxx...",
      "date": "2024-02-15T00:00:00.000Z",
      "type": "OUTFLOW",
      "category": "Labor",
      "description": "Monthly labor costs",
      "forecast": 125000,
      "actual": 128500,
      "variance": -3500,
      "project": {...},
      "createdAt": "2024-02-01T00:00:00.000Z",
      "updatedAt": "2024-02-20T00:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

### Create Cashflow

**Endpoint:** `POST /api/cashflows`

**Permission Required:** `cashflow:create` + project access

**Request Body:**
```json
{
  "projectId": "clxxx...",
  "date": "2024-03-15T00:00:00.000Z",
  "type": "INFLOW",
  "category": "Client Payment",
  "description": "Milestone payment 2",
  "forecast": 500000,
  "actual": 500000
}
```

**Cashflow Types:**
- `INFLOW` - Money coming in (payments, revenues)
- `OUTFLOW` - Money going out (expenses, costs)

### Get, Update, Delete Cashflow

Similar patterns to previous APIs.

---

## Error Handling

All endpoints follow consistent error handling:

**Status Codes:**
- `200 OK` - Successful GET/PUT/DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication error
- `403 Forbidden` - Authorization error
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

**Error Response Format:**
```json
{
  "error": "Error message",
  "details": "Additional details (for validation errors)"
}
```

## Audit Logging

All CREATE, UPDATE, and DELETE operations are automatically logged in the audit trail with:
- User ID
- Action type
- Entity type and ID
- Changes made (before/after for updates)
- Timestamp

Access audit logs through the AuditLog model (separate API endpoints can be created if needed).

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting in production environments.

## API Versioning

Current version: v1 (implicit)
Future versions can be added with URL prefixes: `/api/v2/...`
