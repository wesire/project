# Quick Fix Map - Routing/Action Failures

## Issue 1: /portfolio Auth Error ⚠️
**File:** `/app/portfolio/page.tsx:88`  
**Broken:** localStorage.getItem('authToken') returns null  
**Fix:** Create login page OR bypass auth for development  
**API:** `/api/auth/login` exists, needs frontend

## Issue 2: /changes Returns 404 🔴
**Missing File:** `/app/changes/page.tsx`  
**API Exists:** `/app/api/changes/route.ts` ✓  
**Fix:** Create page component (copy pattern from `/app/risks/page.tsx`)

## Issue 3: Project Register Buttons Non-Functional 🔴
**File:** `/app/projects/page.tsx`  

| Line | Button | Missing Handler | Should Do |
|------|--------|----------------|-----------|
| 79 | "+ New Project" | No onClick | Open modal, POST /api/projects |
| 121 | "View Details" | No onClick | Navigate to /projects/[id] |
| 122 | "Edit" | No onClick | Open edit modal, PUT /api/projects/[id] |
| 123 | "Risks" | No onClick | Navigate to /risks?projectId={id} |
| 124 | "Tasks" | No onClick | Navigate to /tasks?projectId={id} |

**Additional:** Lines 6-40 use hardcoded data instead of GET /api/projects

## Issue 4: Risk Export No Download 🟡
**File:** `/app/risks/page.tsx:265-267`  
**Current Code:**
```tsx
window.open(`/api/risks/export?format=${format}`, '_blank')
```

**Problems:**
1. window.open() doesn't send auth header (401 error)
2. May be blocked by popup blocker

**Fix:** Replace with fetch + blob download:
```tsx
const token = localStorage.getItem('authToken')
const response = await fetch(`/api/risks/export?format=${format}`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
const blob = await response.blob()
// Create download link programmatically
```

**API:** `/app/api/risks/export/route.ts` works correctly (tested, returns 401 without auth)  
**Libraries:** `/lib/export/csv.ts` and `/lib/export/xlsx.ts` exist ✓

---

## Files to Create/Modify

### Create:
- [ ] `/app/changes/page.tsx` - Change log list and CRUD
- [ ] `/app/login/page.tsx` - Login form (optional, for auth fix)
- [ ] `/app/projects/[id]/page.tsx` - Project detail view (for View Details button)

### Modify:
- [ ] `/app/projects/page.tsx` - Add all button handlers, fetch real data
- [ ] `/app/risks/page.tsx:265-267` - Fix export handler

### No Changes Needed:
- ✓ All API routes exist and work correctly
- ✓ Export libraries exist and work
- ✓ Authentication middleware works
- ✓ Database schema is complete

---

## Testing Checklist
- [ ] Navigate to /changes - should show page, not 404
- [ ] Click "+ New Project" - should open modal/form
- [ ] Click "View Details" - should navigate to project detail
- [ ] Click "Edit" - should open edit modal
- [ ] Click "Risks" - should navigate to risks filtered by project
- [ ] Click "Tasks" - should navigate to tasks filtered by project
- [ ] Click "Export CSV" in risks - should download file (after auth fix)
- [ ] Navigate to /portfolio - should show data (after auth fix)
