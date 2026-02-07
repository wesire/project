# API Reference

Complete API documentation for the Construction Project Control System.

## Base URL

```
http://localhost:3000/api  # Development
https://your-domain.com/api  # Production
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }  // Optional
  }
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `AUTHENTICATION_ERROR` | 401 | Invalid or missing token |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Server error |

## Endpoints

### Authentication

#### Register User

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123!",
  "role": "VIEWER"  // Optional: ADMIN, PM, QS, SITE, VIEWER
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "VIEWER"
    }
  }
}
```

#### Login

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "VIEWER"
    }
  }
}
```

### Projects

#### List Projects

```http
GET /api/projects
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `perPage` (number): Items per page (default: 30, max: 100)
- `status` (string): Filter by status (PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED)

**Required Permission:** `project:read`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "projectNumber": "PRJ001",
      "name": "Construction Site A",
      "status": "ACTIVE",
      "budget": 1000000,
      "actualCost": 450000,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T00:00:00.000Z"
    }
  ]
}
```

#### Create Project

```http
POST /api/projects
```

**Required Permission:** `project:create` (PM or ADMIN)

**Request Body:**
```json
{
  "projectNumber": "PRJ001",
  "name": "Construction Site A",
  "description": "New construction project",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "budget": 1000000,
  "currency": "GBP",
  "location": "London, UK",
  "client": "ABC Corporation"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "projectNumber": "PRJ001",
    "name": "Construction Site A",
    // ... other fields
  }
}
```

#### Get Project Details

```http
GET /api/projects/:id
```

**Required Permission:** `project:read`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "projectNumber": "PRJ001",
    "name": "Construction Site A",
    // ... all project fields
    "risks": [ ... ],
    "tasks": [ ... ]
  }
}
```

#### Update Project

```http
PUT /api/projects/:id
```

**Required Permission:** `project:update` (PM or ADMIN)

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Project Name",
  "status": "COMPLETED",
  "actualCost": 950000
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

#### Delete Project

```http
DELETE /api/projects/:id
```

**Required Permission:** `project:delete` (ADMIN only)

**Response (200):**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### Risks

#### List Risks

```http
GET /api/risks?projectId=clx...
```

**Query Parameters:**
- `projectId` (string): Filter by project (required)
- `status` (string): Filter by status (OPEN, MITIGATED, CLOSED, ACCEPTED)

**Required Permission:** `risk:read`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "riskNumber": "RISK-001",
      "title": "Weather Delays",
      "probability": 4,
      "impact": 5,
      "score": 20,
      "status": "OPEN"
    }
  ]
}
```

#### Create Risk

```http
POST /api/risks
```

**Required Permission:** `risk:create` (PM or ADMIN)

**Request Body:**
```json
{
  "projectId": "clx...",
  "riskNumber": "RISK-001",
  "title": "Weather Delays",
  "description": "Potential delays due to adverse weather",
  "category": "Environmental",
  "probability": 4,
  "impact": 5,
  "mitigation": "Weather monitoring and flexible scheduling",
  "contingency": "Additional buffer time allocated"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... }
}
```

## Role Permissions

### ADMIN
- Full system access
- User management
- All CRUD operations

### PM (Project Manager)
- Create and manage projects
- Assign resources
- Manage risks and tasks

### QS (Quantity Surveyor)
- View projects
- Manage cashflow
- Manage procurement

### SITE (Site Engineer)
- View projects and tasks
- Update task status
- Create issues and RFIs

### VIEWER
- Read-only access to all modules
- Cannot create or modify data

## Rate Limiting

API rate limiting (if implemented):
- 100 requests per minute per IP
- 1000 requests per hour per user

## Pagination

List endpoints support pagination:

```http
GET /api/projects?page=2&perPage=50
```

Response includes pagination metadata (if implemented):
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 2,
    "perPage": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

## Timestamps

All timestamps are in ISO 8601 format (UTC):
```
2024-01-15T10:30:00.000Z
```

## Example Usage

### Using curl

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.data.token')

# List projects
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN"

# Create project
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectNumber": "PRJ001",
    "name": "New Project",
    "budget": 1000000,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }'
```

### Using JavaScript/TypeScript

```typescript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password'
  })
})
const { data: { token } } = await loginResponse.json()

// List projects
const projectsResponse = await fetch('/api/projects', {
  headers: { 'Authorization': `Bearer ${token}` }
})
const { data: projects } = await projectsResponse.json()
```

## Support

For API issues or questions:
- Check this documentation
- Review the main [README.md](./README.md)
- Create an issue in the repository
