# Change Log Workflow Testing Guide

This guide describes how to test the new Change Log workflow enhancements.

## Database Migration

Before testing, apply the database migration:

```bash
npx prisma migrate deploy
# or for development:
npx prisma migrate dev
```

Then regenerate the Prisma client:

```bash
npx prisma generate
```

## Test Scenarios

### 1. Create Change Order in DRAFT Status

**Endpoint:** `POST /api/changes`

**Request Body:**
```json
{
  "projectId": "your-project-id",
  "changeNumber": "CH-001",
  "title": "Add new feature",
  "description": "This change adds a new feature to the project",
  "requestedBy": "John Doe",
  "scopeImpact": "Adds 3 new components to the UI",
  "costImpact": 5000,
  "timeImpact": 10,
  "taskIds": ["task-id-1", "task-id-2"],
  "budgetLineIds": ["budget-line-id-1"]
}
```

**Expected Response:**
- Status: 201
- Change order created with status "DRAFT"
- submittedDate, approvedDate, implementedDate should be null
- Tasks and budget lines should be linked

### 2. Workflow Transition: DRAFT → SUBMITTED

**Endpoint:** `POST /api/changes/{id}/status`

**Request Body:**
```json
{
  "status": "SUBMITTED"
}
```

**Expected Response:**
- Status: 200
- Change order status updated to "SUBMITTED"
- submittedDate should be set to current timestamp
- approvedDate and implementedDate should remain null

### 3. Workflow Transition: SUBMITTED → UNDER_REVIEW

**Endpoint:** `POST /api/changes/{id}/status`

**Request Body:**
```json
{
  "status": "UNDER_REVIEW"
}
```

**Expected Response:**
- Status: 200
- Change order status updated to "UNDER_REVIEW"

### 4. Workflow Transition: UNDER_REVIEW → APPROVED

**Endpoint:** `POST /api/changes/{id}/status`

**Request Body:**
```json
{
  "status": "APPROVED",
  "approvedBy": "Jane Smith"
}
```

**Expected Response:**
- Status: 200
- Change order status updated to "APPROVED"
- approvedDate should be set to current timestamp
- approvedBy should be "Jane Smith"

### 5. Workflow Transition: APPROVED → IMPLEMENTED

**Endpoint:** `POST /api/changes/{id}/status`

**Request Body:**
```json
{
  "status": "IMPLEMENTED"
}
```

**Expected Response:**
- Status: 200
- Change order status updated to "IMPLEMENTED"
- implementedDate should be set to current timestamp

### 6. Test Invalid Workflow Transition

**Endpoint:** `POST /api/changes/{id}/status`

**Request Body:**
```json
{
  "status": "IMPLEMENTED"
}
```

(Attempt to go directly from DRAFT to IMPLEMENTED)

**Expected Response:**
- Status: 400
- Error message: "Invalid status transition"
- Should include allowed transitions for current status

### 7. Workflow Transition: REJECTED → DRAFT

**Endpoint:** `POST /api/changes/{id}/status`

**Request Body:**
```json
{
  "status": "REJECTED"
}
```

(First reject from UNDER_REVIEW)

Then:

**Request Body:**
```json
{
  "status": "DRAFT"
}
```

**Expected Response:**
- Status: 200
- Change order status updated to "DRAFT"
- approvedDate and implementedDate should be cleared (null)

### 8. Get Change Order with Linked Entities

**Endpoint:** `GET /api/changes/{id}`

**Expected Response:**
- Status: 200
- Should include:
  - All change order fields including scopeImpact
  - Linked tasks array with task details
  - Linked budget lines array with budget details

### 9. Update Change Order and Re-link Tasks/Budget Lines

**Endpoint:** `PUT /api/changes/{id}`

**Request Body:**
```json
{
  "scopeImpact": "Updated scope impact description",
  "costImpact": 6000,
  "taskIds": ["task-id-3", "task-id-4"],
  "budgetLineIds": ["budget-line-id-2", "budget-line-id-3"]
}
```

**Expected Response:**
- Status: 200
- scopeImpact and costImpact updated
- Old task and budget line links removed
- New tasks and budget lines linked

### 10. List Change Orders with Filters

**Endpoint:** `GET /api/changes?status=DRAFT&projectId=your-project-id`

**Expected Response:**
- Status: 200
- List of change orders filtered by status and project
- Each change order should include linked tasks and budget lines

## Valid Workflow State Transitions

The workflow enforces the following valid transitions:

```
DRAFT → SUBMITTED
SUBMITTED → UNDER_REVIEW | DRAFT
UNDER_REVIEW → APPROVED | REJECTED | SUBMITTED
APPROVED → IMPLEMENTED
REJECTED → DRAFT
IMPLEMENTED → (terminal state, no transitions)
```

## Testing with cURL

### Example: Create a change order

```bash
curl -X POST http://localhost:3000/api/changes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "projectId": "project-id",
    "changeNumber": "CH-001",
    "title": "Test Change",
    "description": "This is a test change order",
    "requestedBy": "Test User",
    "scopeImpact": "Minor scope change",
    "costImpact": 1000,
    "timeImpact": 5
  }'
```

### Example: Transition to SUBMITTED

```bash
curl -X POST http://localhost:3000/api/changes/CHANGE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "SUBMITTED"
  }'
```

## Verification Checklist

- [ ] Change orders can be created in DRAFT status
- [ ] Workflow transitions are enforced correctly
- [ ] Invalid transitions are rejected with proper error messages
- [ ] Timestamps are set correctly for each status
- [ ] Tasks can be linked to change orders
- [ ] Budget lines can be linked to change orders
- [ ] Links can be updated/changed
- [ ] GET requests return complete data with relations
- [ ] Audit logs are created for all operations
- [ ] scopeImpact field is stored and retrieved correctly
- [ ] approvedBy field is set when status is APPROVED
- [ ] submittedDate, approvedDate, implementedDate are set appropriately

## Notes

- All endpoints require proper authentication (JWT token)
- Users must have appropriate permissions (change:create, change:update, change:read)
- Project-level permissions are checked before operations
- Audit logs track all status transitions with before/after states
