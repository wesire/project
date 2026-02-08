# Resource Allocation API Documentation

This document describes the Resource Allocation system API endpoints, including availability calendar management, utilization tracking, and rebalance suggestions.

## Table of Contents

1. [Resource Management](#resource-management)
2. [Availability Calendar](#availability-calendar)
3. [Utilization Analytics](#utilization-analytics)
4. [Rebalance Suggestions](#rebalance-suggestions)

---

## Resource Management

### Enhanced Resource Fields

Resources now include detailed rate information:

```typescript
{
  id: string
  name: string
  type: 'LABOR' | 'EQUIPMENT' | 'MATERIAL' | 'CONTRACTOR'
  description?: string
  costPerHour?: number
  availability?: string
  skills?: string[]
  
  // Enhanced rate fields
  standardRate?: number      // Standard hourly/daily rate
  overtimeRate?: number       // Overtime hourly rate
  weekendRate?: number        // Weekend hourly rate
  currency: string            // Default: "GBP"
  maxHoursPerDay: number      // Default: 8
  maxHoursPerWeek: number     // Default: 40
}
```

### Create Resource

**POST** `/api/resources`

**Permissions Required:** `resource:create` (ADMIN, PM)

**Request Body:**
```json
{
  "name": "Senior Engineer",
  "type": "LABOR",
  "description": "Experienced civil engineer",
  "standardRate": 75.0,
  "overtimeRate": 112.5,
  "weekendRate": 150.0,
  "currency": "GBP",
  "maxHoursPerDay": 8,
  "maxHoursPerWeek": 40,
  "skills": ["structural design", "project planning"]
}
```

**Response:**
```json
{
  "id": "clxxx123",
  "name": "Senior Engineer",
  "type": "LABOR",
  "standardRate": 75.0,
  "overtimeRate": 112.5,
  "weekendRate": 150.0,
  "currency": "GBP",
  "maxHoursPerDay": 8,
  "maxHoursPerWeek": 40,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

## Availability Calendar

The availability calendar tracks when resources are available or unavailable (holidays, maintenance, leave, etc.).

### Get Availability Records

**GET** `/api/resources/availability`

**Permissions Required:** Any authenticated user

**Query Parameters:**
- `resourceId` (optional): Filter by resource ID
- `startDate` (optional): Start date for date range (ISO 8601)
- `endDate` (optional): End date for date range (ISO 8601)
- `isAvailable` (optional): Filter by availability status (true/false)
- `page` (optional): Page number (default: 1)
- `perPage` (optional): Results per page (default: 30, max: 100)
- `sortBy` (optional): Sort field (date, isAvailable, availableHours, createdAt)
- `sortOrder` (optional): Sort order (asc, desc)

**Example Request:**
```
GET /api/resources/availability?resourceId=clxxx123&startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```json
{
  "data": [
    {
      "id": "clyyy456",
      "resourceId": "clxxx123",
      "date": "2024-01-15T00:00:00Z",
      "isAvailable": false,
      "availableHours": 0,
      "reason": "Holiday",
      "notes": "New Year holiday",
      "resource": {
        "id": "clxxx123",
        "name": "Senior Engineer",
        "type": "LABOR"
      },
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 30,
    "total": 1,
    "totalPages": 1
  }
}
```

### Create Availability Record

**POST** `/api/resources/availability`

**Permissions Required:** `resource:create` (ADMIN, PM)

**Request Body:**
```json
{
  "resourceId": "clxxx123",
  "date": "2024-01-15T00:00:00Z",
  "isAvailable": false,
  "availableHours": 0,
  "reason": "Holiday",
  "notes": "New Year holiday"
}
```

**Response:**
```json
{
  "id": "clyyy456",
  "resourceId": "clxxx123",
  "date": "2024-01-15T00:00:00Z",
  "isAvailable": false,
  "availableHours": 0,
  "reason": "Holiday",
  "notes": "New Year holiday",
  "resource": {
    "id": "clxxx123",
    "name": "Senior Engineer",
    "type": "LABOR"
  },
  "createdAt": "2024-01-01T10:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z"
}
```

---

## Utilization Analytics

Calculate resource utilization and detect over-allocation.

### Get Resource Utilization

**GET** `/api/resources/utilization`

**Permissions Required:** Any authenticated user

**Query Parameters (all required):**
- `resourceId`: Resource ID
- `startDate`: Start date (ISO 8601)
- `endDate`: End date (ISO 8601)

**Example Request:**
```
GET /api/resources/utilization?resourceId=clxxx123&startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```json
{
  "resource": {
    "id": "clxxx123",
    "name": "Senior Engineer",
    "type": "LABOR",
    "maxHoursPerDay": 8,
    "maxHoursPerWeek": 40
  },
  "period": {
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T00:00:00Z",
    "totalDays": 31
  },
  "summary": {
    "totalAllocatedHours": 264.0,
    "totalAvailableHours": 248.0,
    "averageUtilization": 106.45,
    "overAllocatedDays": 3,
    "overAllocationPercentage": 9.68
  },
  "warnings": [
    "Resource is over-allocated on 3 day(s) (10% of period)",
    "Average utilization (106%) exceeds capacity"
  ],
  "dailyUtilization": [
    {
      "date": "2024-01-01T00:00:00Z",
      "allocatedHours": 8.0,
      "availableHours": 8,
      "utilizationPercentage": 100.0,
      "isOverAllocated": false,
      "allocations": [
        {
          "projectName": "Bridge Construction",
          "hours": 8.0
        }
      ]
    },
    {
      "date": "2024-01-02T00:00:00Z",
      "allocatedHours": 10.0,
      "availableHours": 8,
      "utilizationPercentage": 125.0,
      "isOverAllocated": true,
      "allocations": [
        {
          "projectName": "Bridge Construction",
          "hours": 6.0
        },
        {
          "projectName": "Road Repairs",
          "hours": 4.0
        }
      ]
    }
  ],
  "totalAllocations": 2
}
```

### Key Metrics Explained

- **totalAllocatedHours**: Total hours allocated to the resource in the period
- **totalAvailableHours**: Total hours the resource is available (considering availability calendar)
- **averageUtilization**: Percentage of available hours that are allocated
- **overAllocatedDays**: Number of days where allocated hours exceed available hours
- **isOverAllocated**: Boolean indicating if a specific day has more hours allocated than available

### Warnings

The system generates warnings for:
- **Over-allocation**: When allocated hours exceed available hours
- **High utilization**: When average utilization exceeds 100%
- **Under-utilization**: When average utilization is below 50% (and resource has allocations)

---

## Rebalance Suggestions

Analyze resource allocations and suggest rebalancing by moving non-critical tasks.

### Get Rebalance Suggestions

**GET** `/api/resources/rebalance`

**Permissions Required:** Any authenticated user

**Query Parameters (all required):**
- `projectId`: Project ID
- `startDate`: Start date (ISO 8601)
- `endDate`: End date (ISO 8601)

**Example Request:**
```
GET /api/resources/rebalance?projectId=clppp789&startDate=2024-01-01&endDate=2024-01-31
```

**Response:**
```json
{
  "project": {
    "id": "clppp789"
  },
  "period": {
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T00:00:00Z",
    "totalDays": 31
  },
  "analysis": {
    "totalResources": 5,
    "overAllocatedResources": 2,
    "underUtilizedResources": 1,
    "totalTasks": 15,
    "criticalPathTasks": 8,
    "nonCriticalTasks": 7
  },
  "suggestions": [
    {
      "type": "move_task",
      "priority": "high",
      "description": "Move non-critical task \"Install lighting fixtures\" from over-allocated resource to under-utilized resource",
      "action": {
        "taskId": "clttt111",
        "taskTitle": "Install lighting fixtures",
        "fromResource": "Senior Engineer",
        "toResource": "Junior Engineer",
        "reason": "Source resource is over-allocated (106% utilization, 3 over-allocated days). Target resource is under-utilized (55% utilization).",
        "estimatedImpact": "This could reduce source utilization by ~5%"
      }
    },
    {
      "type": "move_task",
      "priority": "medium",
      "description": "Delay non-critical task \"Paint finishing\" by 2 day(s)",
      "action": {
        "taskId": "clttt222",
        "taskTitle": "Paint finishing",
        "fromDate": "2024-01-15T00:00:00Z",
        "toDate": "2024-01-17T00:00:00Z",
        "reason": "Resource is over-allocated (108% utilization, 4 over-allocated days). No suitable alternative resources available.",
        "estimatedImpact": "This would shift 16 hours to a less congested period"
      }
    }
  ],
  "resourceSummary": [
    {
      "resourceId": "clxxx123",
      "resourceName": "Senior Engineer",
      "resourceType": "LABOR",
      "utilizationPercentage": 106.45,
      "allocatedHours": 264.0,
      "availableHours": 248.0,
      "overAllocatedDays": 3,
      "status": "over-allocated"
    },
    {
      "resourceId": "clxxx456",
      "resourceName": "Junior Engineer",
      "resourceType": "LABOR",
      "utilizationPercentage": 55.23,
      "allocatedHours": 137.0,
      "availableHours": 248.0,
      "overAllocatedDays": 0,
      "status": "under-utilized"
    }
  ]
}
```

### Suggestion Types

1. **move_task**: Suggests moving a task from one resource to another
2. **redistribute_hours**: Suggests redistributing allocation hours
3. **adjust_allocation**: Suggests adjusting resource allocations

### Suggestion Priorities

- **high**: Critical over-allocation that needs immediate attention
- **medium**: Moderate over-allocation or inefficiency
- **low**: Minor optimization opportunities

### Rebalancing Algorithm

The system analyzes:
1. **Resource utilization** across all resources in the project
2. **Task criticality** (critical path vs non-critical)
3. **Task priority** (LOW, MEDIUM, HIGH, CRITICAL)
4. **Resource types** (matching skills/capabilities)
5. **Available capacity** in under-utilized resources

Suggestions prioritize:
- Moving non-critical, low-priority tasks first
- Matching resource types and skills
- Maintaining critical path integrity
- Balancing workload across the team

### Resource Status

- **over-allocated**: Resource has days where allocated hours exceed available hours
- **fully-utilized**: 90-100% utilization
- **well-utilized**: 70-90% utilization
- **under-utilized**: Less than 70% utilization

---

## Error Responses

All endpoints return standard error responses:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": "startDate is required"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Use Cases

### 1. Planning Resource Holidays

```bash
# Mark a resource as unavailable for holidays
POST /api/resources/availability
{
  "resourceId": "clxxx123",
  "date": "2024-12-25",
  "isAvailable": false,
  "availableHours": 0,
  "reason": "Holiday",
  "notes": "Christmas Day"
}
```

### 2. Checking Resource Utilization

```bash
# Check if a resource is over-allocated
GET /api/resources/utilization?resourceId=clxxx123&startDate=2024-01-01&endDate=2024-01-31
```

### 3. Optimizing Project Resources

```bash
# Get suggestions to rebalance workload
GET /api/resources/rebalance?projectId=clppp789&startDate=2024-01-01&endDate=2024-03-31
```

### 4. Equipment Maintenance Scheduling

```bash
# Mark equipment as unavailable for maintenance
POST /api/resources/availability
{
  "resourceId": "cleqp456",
  "date": "2024-02-15",
  "isAvailable": false,
  "availableHours": 0,
  "reason": "Maintenance",
  "notes": "Scheduled maintenance for excavator"
}
```

---

## Best Practices

1. **Update availability calendar regularly** to reflect holidays, leave, and maintenance schedules
2. **Monitor utilization metrics** weekly to catch over-allocation early
3. **Review rebalance suggestions** during sprint planning or resource allocation meetings
4. **Set realistic maxHoursPerDay** values based on resource type (e.g., 8 for labor, 24 for equipment)
5. **Use different rate types** (standard, overtime, weekend) for accurate cost calculations
6. **Consider critical path** when implementing rebalance suggestions to avoid project delays
7. **Balance workload** to maintain team morale and prevent burnout (aim for 70-90% utilization)

---

## Integration Examples

### TypeScript/JavaScript

```typescript
// Get utilization for a resource
async function getResourceUtilization(resourceId: string, startDate: Date, endDate: Date) {
  const response = await fetch(
    `/api/resources/utilization?resourceId=${resourceId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  )
  return await response.json()
}

// Get rebalance suggestions
async function getRebalanceSuggestions(projectId: string, startDate: Date, endDate: Date) {
  const response = await fetch(
    `/api/resources/rebalance?projectId=${projectId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  )
  return await response.json()
}
```

### cURL

```bash
# Get utilization
curl -X GET "http://localhost:3000/api/resources/utilization?resourceId=clxxx123&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create availability record
curl -X POST "http://localhost:3000/api/resources/availability" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceId": "clxxx123",
    "date": "2024-12-25",
    "isAvailable": false,
    "availableHours": 0,
    "reason": "Holiday"
  }'

# Get rebalance suggestions
curl -X GET "http://localhost:3000/api/resources/rebalance?projectId=clppp789&startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
