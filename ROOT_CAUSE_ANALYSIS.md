# Root Cause Analysis - Routing and Action Failures

**Analysis Date:** 2026-02-08  
**Repository:** wesire/project  
**Application:** Construction Project Control System (Next.js 15 App Router)

---

## Executive Summary

Four critical issues identified in the application related to missing frontend routes, non-functional UI buttons, and authentication requirements. All issues have been diagnosed with specific file paths and root causes documented below.

---

## Issue #1: /portfolio Authentication Error

### Symptom
- Accessing `/portfolio` page shows error: "Authentication required. Please log in."
- Page loads but fails to fetch dashboard data

### Root Cause
**API Authentication Requirement Not Met**

The portfolio dashboard page attempts to fetch data from `/api/portfolio/dashboard` without providing authentication credentials.

### File Paths & Code Analysis

**Frontend:** `/app/portfolio/page.tsx`
- **Line 88:** `const token = localStorage.getItem('authToken')`
- **Line 94:** `const response = await fetch('/api/portfolio/dashboard', { headers: { 'Authorization': `Bearer ${token}` } })`
- **Problem:** No mechanism to set `authToken` in localStorage. The token is null on first load.

**Backend API:** `/app/api/portfolio/dashboard/route.ts`
- **Line 66:** `const user = await authenticateRequest(request)`
- **Middleware:** `/lib/middleware.ts` (Line 14-29)
  - Requires `Authorization: Bearer <token>` header
  - Throws `AuthenticationError` if missing/invalid
- **Line 286-289:** Returns 401 status for authentication errors

### Exact Fix Required
1. **Create authentication flow:**
   - Add login page at `/app/login/page.tsx`
   - Implement form to call `/api/auth/login`
   - Store JWT token in localStorage as `authToken` on successful login
   
2. **Alternative fix (if auth not needed for demo):**
   - Add mock authentication mode or bypass authentication for development
   - Update portfolio page to handle missing token gracefully

---

## Issue #2: /changes Route Returns 404

### Symptom
- Clicking "Change Log" link from home page (`/changes`) returns 404
- HTTP Status: 404 Not Found

### Root Cause
**Missing Frontend Page Route**

The API routes exist but the corresponding frontend page component is missing.

### File Paths & Evidence

**Missing File:** `/app/changes/page.tsx` - **DOES NOT EXIST**

**Existing API Routes:**
- `/app/api/changes/route.ts` ✓ EXISTS (GET, POST handlers)
- `/app/api/changes/[id]/route.ts` ✓ EXISTS (GET, PUT, DELETE handlers)
- `/app/api/changes/[id]/status/route.ts` ✓ EXISTS (PATCH handler)

**Navigation Link:** `/app/page.tsx` (Line 35-38)
```tsx
<Link href="/changes" className="card hover:shadow-lg transition-shadow">
  <h2 className="text-xl font-bold mb-2 text-orange-600">🔄 Change Log</h2>
  <p className="text-gray-600">Track changes with cost/time impact</p>
</Link>
```

**API Data Structure Reference:** `/app/api/portfolio/dashboard/route.ts` (Lines 93-102)
- Shows `changes` table has: `changeNumber`, `title`, `status`, `costImpact`, `timeImpact`, `submittedDate`

### Exact Fix Required
1. **Create page component:** `/app/changes/page.tsx`
2. **Required functionality:**
   - Display list of changes from GET `/api/changes`
   - Show change details: number, title, status, cost/time impact
   - Add button to create new change (POST `/api/changes`)
   - Support edit/delete actions
   - Status update functionality (PATCH `/api/changes/[id]/status`)
3. **Follow pattern from:** `/app/risks/page.tsx` (similar structure)

---

## Issue #3: Project Register Buttons Non-Functional

### Symptom
- "Add Project" button does nothing
- "View Details", "Edit", "Risks", "Tasks" buttons do nothing
- No onClick handlers attached

### Root Cause
**Missing Event Handlers on Static Buttons**

All buttons are hardcoded with no click event handlers or navigation logic.

### File Paths & Code Analysis

**File:** `/app/projects/page.tsx`

**Line 79:** "Add Project" button
```tsx
<button className="btn btn-primary">+ New Project</button>
```
- **Problem:** No `onClick` handler
- **Should:** Open modal or navigate to create form

**Lines 121-124:** Project action buttons
```tsx
<button className="btn btn-primary text-sm">View Details</button>
<button className="btn btn-secondary text-sm">Edit</button>
<button className="text-blue-600 hover:text-blue-800 px-3">Risks</button>
<button className="text-blue-600 hover:text-blue-800 px-3">Tasks</button>
```
- **Problem:** No `onClick` handlers, no navigation
- **Should:** Each button needs proper action

**Additional Issue:** Projects data is hardcoded (Lines 6-40)
```tsx
const projects = [
  { id: '1', projectNumber: 'PRJ001', name: 'City Centre Office Block', ... },
  // Static mock data, not fetched from API
]
```

### API Routes Available
- GET `/api/projects` - Fetch all projects ✓
- POST `/api/projects` - Create project ✓
- GET `/api/projects/[id]` - Get single project ✓
- PUT `/api/projects/[id]` - Update project ✓
- DELETE `/api/projects/[id]` - Delete project ✓

### Exact Fix Required

1. **Fetch real data:**
   - Replace hardcoded array with `useEffect` + `fetch('/api/projects')`
   - Handle loading/error states

2. **Add Project button (Line 79):**
   ```tsx
   const [showModal, setShowModal] = useState(false)
   <button onClick={() => setShowModal(true)} className="btn btn-primary">
     + New Project
   </button>
   ```
   - Add modal/form component for project creation
   - Submit to POST `/api/projects`

3. **View Details button (Line 121):**
   ```tsx
   <button onClick={() => router.push(`/projects/${project.id}`)} className="btn btn-primary text-sm">
     View Details
   </button>
   ```
   - Requires new page: `/app/projects/[id]/page.tsx`

4. **Edit button (Line 122):**
   ```tsx
   <button onClick={() => handleEdit(project.id)} className="btn btn-secondary text-sm">
     Edit
   </button>
   ```
   - Open modal with pre-filled form
   - Submit to PUT `/api/projects/[id]`

5. **Risks button (Line 123):**
   ```tsx
   <button onClick={() => router.push(`/risks?projectId=${project.id}`)} className="text-blue-600">
     Risks
   </button>
   ```

6. **Tasks button (Line 124):**
   ```tsx
   <button onClick={() => router.push(`/tasks?projectId=${project.id}`)} className="text-blue-600">
     Tasks
   </button>
   ```

---

## Issue #4: Risk Export No Download

### Symptom
- Clicking "Export CSV" or "Export XLSX" buttons does nothing visible
- No file download triggers

### Root Cause
**Authentication Required + window.open() Behavior**

The export functionality exists but has two problems:
1. API requires authentication (no token sent in new window)
2. Using `window.open()` may be blocked by popup blockers

### File Paths & Code Analysis

**Frontend:** `/app/risks/page.tsx`

**Line 265-267:** Export handler
```tsx
const handleExport = (format: 'csv' | 'xlsx') => {
  window.open(`/api/risks/export?format=${format}`, '_blank')
}
```
- **Problem 1:** Opens in new window without auth header
- **Problem 2:** `window.open()` may be blocked by browser

**Lines 485-495:** Export buttons
```tsx
<button onClick={() => handleExport('csv')} className="btn btn-secondary">
  📄 Export CSV
</button>
<button onClick={() => handleExport('xlsx')} className="btn btn-success">
  📊 Export XLSX
</button>
```

**Backend API:** `/app/api/risks/export/route.ts`

**Line 13:** Requires authentication
```tsx
const user = await authenticateRequest(request)
```
- Returns 401 if no token provided

**Lines 70-92:** Returns file correctly with proper headers
- CSV: `Content-Type: text/csv` + `Content-Disposition: attachment`
- XLSX: `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

**Export Libraries:** `/lib/export/csv.ts` and `/lib/export/xlsx.ts` ✓ EXIST

### Exact Fix Required

**Option 1: Fetch + Blob Download (Recommended)**
```tsx
const handleExport = async (format: 'csv' | 'xlsx') => {
  try {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`/api/risks/export?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Export failed')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `risk-register-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Export error:', error)
    alert('Export failed. Please try again.')
  }
}
```

**Option 2: Add Token to URL (Less secure)**
- Append token as query parameter
- Not recommended for production

---

## Summary Table

| Issue | File Path | Root Cause | Fix Complexity |
|-------|-----------|------------|----------------|
| /portfolio auth error | `/app/portfolio/page.tsx:88` | No auth token in localStorage | Medium - Need login flow |
| /changes 404 | `/app/changes/page.tsx` (missing) | Frontend page doesn't exist | Medium - Create full CRUD page |
| Project buttons broken | `/app/projects/page.tsx:79,121-124` | No onClick handlers, static data | High - Multiple handlers + API integration |
| Risk export no download | `/app/risks/page.tsx:265-267` | window.open() + missing auth | Low - Replace with fetch+blob |

---

## Dependencies & Infrastructure

**Authentication System:**
- JWT-based auth in `/lib/auth.ts`
- Middleware in `/lib/middleware.ts`
- Login API at `/api/auth/login/route.ts`
- Register API at `/api/auth/register/route.ts`
- **Missing:** Login page UI

**Database:**
- Prisma ORM (`/lib/prisma.ts`)
- PostgreSQL backend
- Schema in `/prisma/schema.prisma`

**Export System:**
- CSV generator: `/lib/export/csv.ts` ✓
- XLSX generator: `/lib/export/xlsx.ts` ✓
- All utility functions working

---

## Recommendations

1. **Priority 1 (Blocking):**
   - Create `/app/changes/page.tsx` (Issue #2)
   - Fix risk export download (Issue #4) - Quick win

2. **Priority 2 (High Impact):**
   - Implement login page and auth flow (Issue #1)
   - Fix project buttons with API integration (Issue #3)

3. **Code Quality:**
   - Replace all hardcoded mock data with API calls
   - Add consistent error handling across all pages
   - Implement loading states

4. **Security:**
   - Never pass JWT tokens in URL query parameters
   - Use fetch with Authorization headers for all authenticated requests
   - Implement proper session management

---

**End of Analysis**
