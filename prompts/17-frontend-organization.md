# Prompt 17 — Frontend Organization Setup Page

## Context
You are building **AssetFlow**. The Dashboard is complete (Prompt 16). Now build the Organization Setup page — the **Admin-only** screen with 3 tabs that manages departments, asset categories, and the employee directory.

---

## What to Build

### Page: `src/pages/OrganizationPage.tsx`

**Admin-only page** with 3 tabs:
1. **Department Management**
2. **Asset Categories**
3. **Employee Directory**

Use the `Tabs` component from Prompt 14.

---

### Tab A: Department Management

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  [+ Create Department]                    🔍 Search     │
├─────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐ │
│  │ Name     │ Head      │ Parent    │ Staff │ Status  │ │
│  │──────────│───────────│───────────│───────│─────────│ │
│  │ IT Dept  │ Priya P.  │ —         │  4    │ ACTIVE  │ │
│  │ HR Dept  │ Amit K.   │ —         │  1    │ ACTIVE  │ │
│  │ Frontend │ —         │ IT Dept   │  0    │ ACTIVE  │ │
│  │ Backend  │ —         │ IT Dept   │  0    │ ACTIVE  │ │
│  │ Ops      │ —         │ —         │  1    │ ACTIVE  │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  Pagination: < 1 2 3 >                                 │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Data table with columns: Name, Head, Parent Department, Employee Count, Status, Actions
- Search by name
- Status badge (ACTIVE green, INACTIVE gray)
- Actions: Edit (pencil icon), Deactivate (toggle)
- Create Department button → opens modal

**Create/Edit Department Modal:**
```
┌─────────────────────────────────────┐
│  Create Department            ✕     │
│─────────────────────────────────────│
│  Department Name*                   │
│  [________________________]         │
│                                     │
│  Description                        │
│  [________________________]         │
│                                     │
│  Parent Department                  │
│  [Select... ▼]                      │
│                                     │
│  Department Head                    │
│  [Select... ▼]                      │
│                                     │
│  Status                             │
│  [Active ▼]                         │
│                                     │
│  [Cancel]     [Create Department]   │
└─────────────────────────────────────┘
```

- Parent Department: dropdown of existing departments
- Department Head: dropdown of users in this department (or all users)
- Validation: name is required, name must be unique

---

### Tab B: Asset Categories

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  [+ Create Category]                     🔍 Search      │
├─────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐ │
│  │ Name         │ Warranty │ Assets │ Status │ Action │ │
│  │──────────────│──────────│────────│────────│────────│ │
│  │ Electronics  │ 24 mo    │ 5      │ ACTIVE │ ✏️     │ │
│  │ Furniture    │ 60 mo    │ 2      │ ACTIVE │ ✏️     │ │
│  │ Vehicles     │ 36 mo    │ 2      │ ACTIVE │ ✏️     │ │
│  │ Conf Rooms   │ —        │ 3      │ ACTIVE │ ✏️     │ │
│  │ Lab Equip    │ 12 mo    │ 1      │ ACTIVE │ ✏️     │ │
│  │ Office Supp  │ —        │ 2      │ ACTIVE │ ✏️     │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Create/Edit Category Modal:**
- Category Name*
- Description
- Warranty Period (number input, in months, optional)
- Status (Active/Inactive)

---

### Tab C: Employee Directory

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  🔍 Search         [Dept ▼] [Role ▼] [Status ▼]       │
├─────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐ │
│  │ Code   │ Name      │ Email       │ Dept  │ Role   │ │
│  │────────│───────────│─────────────│───────│────────│ │
│  │ EMP-001│ Admin     │ admin@..    │ —     │ ADMIN  │ │
│  │ EMP-002│ Rohit S.  │ rohit@..    │ IT    │ A.MGR  │ │
│  │ EMP-003│ Priya P.  │ priya@..    │ IT    │ D.HEAD │ │
│  │ EMP-004│ Amit K.   │ amit@..     │ HR    │ D.HEAD │ │
│  │ EMP-005│ Sneha R.  │ sneha@..    │ IT    │ EMP    │ │
│  │ EMP-006│ Raj M.    │ raj@..      │ IT    │ EMP    │ │
│  │ EMP-007│ Ananya S. │ ananya@..   │ HR    │ EMP    │ │
│  │ EMP-008│ Vikram D. │ vikram@..   │ Ops   │ EMP    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  Pagination: < 1 >                                      │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Search by name or email
- Filter by Department, Role, Status
- Role badge with color coding:
  - ADMIN → Purple
  - ASSET_MANAGER → Blue
  - DEPARTMENT_HEAD → Teal
  - EMPLOYEE → Gray
- Actions column: Edit, Promote, Deactivate

**Edit Employee Modal:**
- Name, Email, Phone, Department (dropdown)
- Cannot change role here — use Promote action

**Promote Employee Action:**
When clicking "Promote", show a modal:
```
┌─────────────────────────────────────┐
│  Promote Employee              ✕    │
│─────────────────────────────────────│
│                                     │
│  Employee: Sneha Reddy (EMP-005)    │
│  Current Role: EMPLOYEE             │
│                                     │
│  New Role:                          │
│  [Select Role ▼]                    │
│    • Department Head                │
│    • Asset Manager                  │
│    • Admin                          │
│    • Employee (demote)              │
│                                     │
│  ⚠️ This is the ONLY way to        │
│  assign roles in AssetFlow.         │
│                                     │
│  [Cancel]      [Confirm Promotion]  │
└─────────────────────────────────────┘
```

After promotion, show success toast and refresh the table.

---

### Shared Table Component Enhancement

If not already built in Prompt 14, enhance the `Table` component with:
- Column sorting (click header to sort)
- Empty state when no data
- Loading skeleton rows
- Pagination controls (Previous, page numbers, Next)

---

### Data Fetching Pattern

Each tab fetches data independently:
```typescript
// Department tab
const { data: departments, refetch } = useApi(
  () => departmentService.getAll({ page, limit, search }),
  [page, search]
);

// Category tab
const { data: categories, refetch } = useApi(
  () => categoryService.getAll({ page, limit, search }),
  [page, search]
);

// Employee tab
const { data: users, refetch } = useApi(
  () => userService.getAll({ page, limit, search, departmentId, role, status }),
  [page, search, departmentId, role, status]
);
```

---

### Form Handling

Use React Hook Form for all modals:
```typescript
const { register, handleSubmit, formState: { errors }, reset } = useForm({
  resolver: zodResolver(schema),
  defaultValues: isEdit ? existingData : {},
});

const onSubmit = async (data) => {
  try {
    if (isEdit) {
      await service.update(id, data);
      showToast('Updated successfully', 'success');
    } else {
      await service.create(data);
      showToast('Created successfully', 'success');
    }
    reset();
    closeModal();
    refetch();
  } catch (error) {
    showToast(error.response?.data?.message || 'An error occurred', 'error');
  }
};
```

---

## Verification

1. Login as Admin → Navigate to Organization
2. See 3 tabs: Departments, Categories, Employees
3. Department tab: see 5 departments with hierarchy info
4. Create a new department with a parent → appears in table
5. Category tab: see 6 categories with asset counts
6. Employee tab: see 8 employees with role badges
7. Promote an employee → role changes, toast shows
8. Search and filter work correctly
9. Non-admin users cannot access this page (redirect to dashboard)

---

## What's Next
Prompt 18 will build the Asset Registration and Directory pages.
