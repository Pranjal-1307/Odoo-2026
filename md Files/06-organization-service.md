# Prompt 06 — Organization Service (Departments, Categories, Employee Directory)

## Context
You are building **AssetFlow**. Authentication is complete (Prompt 05). Now build the Organization Setup module — this is the **Admin-only** screen with 3 tabs that manages the master data everything else depends on.

---

## What to Build

Three sub-modules, all Admin-only:
1. **Department Management** — CRUD with hierarchy
2. **Asset Category Management** — CRUD with custom fields
3. **Employee Directory** — view/edit employees, **role promotion** (the only way to assign roles)

---

## 1. Department Management

### Validation Schema — `src/validators/department.validator.ts`
```typescript
export const createDepartmentSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
  headId: z.string().uuid().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();
```

### Repository — `src/repositories/department.repository.ts`
```typescript
findAll(params: PaginationParams)       // with employee count, head info, parent info
findById(id: string)                    // with employees, head, parent, children
create(data)                            // create department
update(id: string, data)               // update department
deactivate(id: string)                 // set status to INACTIVE
getHierarchy()                         // return full tree structure
```

### Service — `src/services/department.service.ts`
- `getAllDepartments(params)` — paginated list with search by name
- `getDepartmentById(id)` — full detail with employees
- `createDepartment(data, userId)` — create + log activity
- `updateDepartment(id, data, userId)` — update + log activity
  - If assigning a `headId`, validate the user exists and optionally update their role to DEPARTMENT_HEAD
- `deactivateDepartment(id, userId)` — set inactive + log activity
  - Check: cannot deactivate if department has active employees
- `getDepartmentHierarchy()` — return nested tree

### Controller — `src/controllers/department.controller.ts`
Standard CRUD controller methods.

### Routes — `src/routes/department.routes.ts`
```
GET    /api/departments              → authenticate, authorize(ADMIN) → getAll
GET    /api/departments/hierarchy    → authenticate, authorize(ADMIN) → getHierarchy
GET    /api/departments/:id          → authenticate, authorize(ADMIN, DEPARTMENT_HEAD) → getById
POST   /api/departments              → authenticate, authorize(ADMIN), validate → create
PUT    /api/departments/:id          → authenticate, authorize(ADMIN), validate → update
PATCH  /api/departments/:id/deactivate → authenticate, authorize(ADMIN) → deactivate
```

### API Contracts

**GET `/api/departments`**
Query params: `page`, `limit`, `search`, `status`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "IT Department",
      "description": "...",
      "status": "ACTIVE",
      "parent": { "id": "uuid", "name": "..." },
      "head": { "id": "uuid", "name": "Priya Patel", "email": "..." },
      "_count": { "employees": 4 }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 5, "totalPages": 1 }
}
```

**POST `/api/departments`**
```json
{
  "name": "Finance Department",
  "description": "Handles all financial operations",
  "parentId": null,
  "headId": "uuid-of-user"
}
```

---

## 2. Category Management

### Validation Schema — `src/validators/category.validator.ts`
```typescript
export const createCategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  warrantyPeriod: z.number().int().positive().optional().nullable(),
  customFields: z.record(z.any()).optional(), // flexible JSON
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
```

### Repository — `src/repositories/category.repository.ts`
```typescript
findAll(params: PaginationParams)    // with asset count
findById(id: string)                 // with assets
create(data)
update(id: string, data)
```

### Service — `src/services/category.service.ts`
- `getAllCategories(params)` — paginated, searchable
- `getCategoryById(id)`
- `createCategory(data, userId)` — create + log
- `updateCategory(id, data, userId)` — update + log
  - Cannot deactivate category with active assets

### Controller & Routes
```
GET    /api/categories            → authenticate → getAll
GET    /api/categories/:id        → authenticate → getById
POST   /api/categories            → authenticate, authorize(ADMIN), validate → create
PUT    /api/categories/:id        → authenticate, authorize(ADMIN), validate → update
```

### API Contracts

**GET `/api/categories`**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Electronics",
      "description": "Laptops, desktops, monitors, peripherals",
      "warrantyPeriod": 24,
      "status": "ACTIVE",
      "_count": { "assets": 5 }
    }
  ]
}
```

---

## 3. Employee Directory

### Validation Schema — `src/validators/user.validator.ts`
```typescript
export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  departmentId: z.string().uuid().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const promoteUserSchema = z.object({
  role: z.enum(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE']),
});
```

### Repository — `src/repositories/user.repository.ts`
```typescript
findAll(params: PaginationParams & { departmentId?: string, role?: string, status?: string })
findById(id: string)              // with department, allocations count
update(id: string, data)
updateRole(id: string, role: UserRole)
```

### Service — `src/services/user.service.ts`

- `getAllUsers(params)` — paginated, filterable by department/role/status
- `getUserById(id)` — with department info and allocation stats
- `updateUser(id, data, adminUserId)` — update profile + log
- `promoteUser(id, role, adminUserId)` — **THIS IS THE ONLY PLACE ROLES ARE ASSIGNED**
  - Only Admin can call this
  - Log activity: "Admin promoted {user} to {role}"
  - Create notification for the user: "You have been promoted to {role}"
- `deactivateUser(id, adminUserId)` — set status INACTIVE
  - Check: cannot deactivate user with active allocations

### Controller & Routes
```
GET    /api/users                    → authenticate, authorize(ADMIN, ASSET_MANAGER) → getAll
GET    /api/users/:id                → authenticate → getById
PUT    /api/users/:id                → authenticate, authorize(ADMIN) → update
PATCH  /api/users/:id/promote        → authenticate, authorize(ADMIN), validate(promoteUserSchema) → promote
PATCH  /api/users/:id/deactivate     → authenticate, authorize(ADMIN) → deactivate
```

### API Contracts

**GET `/api/users`**
Query params: `page`, `limit`, `search`, `departmentId`, `role`, `status`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "employeeCode": "EMP-001",
      "name": "Admin User",
      "email": "admin@assetflow.com",
      "role": "ADMIN",
      "status": "ACTIVE",
      "phone": null,
      "department": { "id": "uuid", "name": "IT Department" },
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 8, "totalPages": 1 }
}
```

**PATCH `/api/users/:id/promote`**
```json
{ "role": "DEPARTMENT_HEAD" }
```
Response:
```json
{
  "success": true,
  "message": "User promoted to DEPARTMENT_HEAD successfully",
  "data": { "id": "uuid", "name": "Priya Patel", "role": "DEPARTMENT_HEAD" }
}
```

---

## Register All Routes in App

Update `src/app.ts`:
```typescript
import { authRouter } from './routes/auth.routes';
import { departmentRouter } from './routes/department.routes';
import { categoryRouter } from './routes/category.routes';
import { userRouter } from './routes/user.routes';

app.use('/api/auth', authRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/users', userRouter);
```

---

## Business Rules Summary

1. **Departments**: Support hierarchy via `parentId`. Cannot deactivate with active employees.
2. **Categories**: Support optional warranty period and custom fields. Cannot deactivate with active assets.
3. **Employee Directory**: Only Admin can promote roles. This is the ONLY place roles are assigned. Role selection is NOT available at signup.
4. **Activity Logging**: Every create/update/promote/deactivate action writes to the ActivityLog table.
5. **Notifications**: Role promotion triggers a notification to the affected user.

---

## Verification

```bash
# Get all departments
curl http://localhost:5000/api/departments \
  -H "Authorization: Bearer <admin-token>"

# Create a department
curl -X POST http://localhost:5000/api/departments \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Finance Department","description":"Financial ops"}'

# Promote a user
curl -X PATCH http://localhost:5000/api/users/<user-id>/promote \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"role":"ASSET_MANAGER"}'

# Non-admin should get 403
curl http://localhost:5000/api/departments \
  -H "Authorization: Bearer <employee-token>"
```

---

## What's Next
Prompt 07 will build the Asset Service (Registration, Search, Lifecycle, QR Code, History).
