# Prompt 07 — Asset Service (Registration, Search, Lifecycle, QR Code, History)

## Context
You are building **AssetFlow**. Organization setup is complete (Prompt 06). Now build the core Asset module — registration, directory search, lifecycle management, QR codes, and per-asset history.

---

## What to Build

### Validation Schema — `src/validators/asset.validator.ts`
```typescript
export const registerAssetSchema = z.object({
  name: z.string().min(2, 'Asset name is required'),
  categoryId: z.string().uuid('Invalid category'),
  departmentId: z.string().uuid().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  acquisitionDate: z.string().datetime().optional().nullable(),
  acquisitionCost: z.number().positive().optional().nullable(),
  bookable: z.boolean().optional(),
});

export const updateAssetSchema = registerAssetSchema.partial().extend({
  status: z.enum(['AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED']).optional(),
});

export const searchAssetSchema = z.object({
  search: z.string().optional(),           // searches name, assetTag, serialNumber
  categoryId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  status: z.string().optional(),
  location: z.string().optional(),
  bookable: z.string().optional(),         // "true" or "false"
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
```

---

### Repository — `src/repositories/asset.repository.ts`

```typescript
class AssetRepository {
  // Core CRUD
  findAll(params: AssetSearchParams): Promise<PaginatedResult<Asset>>
  findById(id: string): Promise<Asset | null>  // includes category, department, createdBy
  findByAssetTag(tag: string): Promise<Asset | null>
  create(data: CreateAssetData): Promise<Asset>
  update(id: string, data: UpdateAssetData): Promise<Asset>
  
  // Search
  search(params: AssetSearchParams): Promise<PaginatedResult<Asset>>
  // Build a dynamic Prisma where clause supporting:
  // - text search on name, assetTag, serialNumber (contains, case-insensitive)
  // - filter by categoryId, departmentId, status, location, bookable
  // - pagination with page/limit
  // - sorting by any field
  
  // History
  getAssetHistory(assetId: string): Promise<{
    allocations: AssetAllocation[];
    maintenance: MaintenanceRequest[];
    audits: AuditItem[];
    bookings: Booking[];
  }>
  
  // Stats
  getAssetStats(): Promise<{
    total: number;
    byStatus: { status: string; count: number }[];
    byCategory: { category: string; count: number }[];
    byDepartment: { department: string; count: number }[];
  }>
  
  // Tag generation
  getLastAssetTag(): Promise<string | null>
}
```

---

### Service — `src/services/asset.service.ts`

#### `registerAsset(data, userId)`
1. Validate category exists and is ACTIVE
2. If `serialNumber` provided, check uniqueness → `AppError.conflict('Serial number already registered')`
3. Generate asset tag via `generateAssetTag()` util
4. Generate QR code via `generateQRCode(assetTag)` util
5. Create asset with status = `AVAILABLE`, `createdById = userId`
6. Log activity: "Registered asset {assetTag} ({name})"
7. Return created asset

#### `getAllAssets(params)`
1. Build search/filter criteria from params
2. Return paginated results with category and department info

#### `getAssetById(id)`
1. Find asset → throw `AppError.notFound()` if missing
2. Include: category, department, createdBy, current active allocation (if any)
3. Return asset

#### `getAssetByTag(tag)`
1. Find by asset tag → throw if missing
2. Return asset with details

#### `updateAsset(id, data, userId)`
1. Validate asset exists
2. If changing status, validate the transition is allowed (see lifecycle rules below)
3. Update asset
4. Log activity
5. Return updated asset

#### `getAssetHistory(id)`
1. Validate asset exists
2. Query allocation history (ordered by date desc)
3. Query maintenance history (ordered by date desc)
4. Query audit records
5. Query booking history
6. Return combined timeline

#### `getAssetStats()`
1. Count total assets
2. Group by status
3. Group by category
4. Group by department
5. Return aggregated stats

#### `searchAssets(params)`
1. Apply all filters from search params
2. Return paginated results

---

### Asset Lifecycle Rules

Valid status transitions:
```
AVAILABLE → ALLOCATED          (via allocation)
AVAILABLE → RESERVED           (via booking)
AVAILABLE → UNDER_MAINTENANCE  (via maintenance approval)
AVAILABLE → RETIRED            (manual)
AVAILABLE → DISPOSED           (manual)

ALLOCATED → AVAILABLE          (via return)
ALLOCATED → UNDER_MAINTENANCE  (via maintenance approval)
ALLOCATED → LOST               (via audit or manual)

RESERVED → AVAILABLE           (booking ends/cancelled)

UNDER_MAINTENANCE → AVAILABLE  (maintenance resolved)
UNDER_MAINTENANCE → RETIRED    (beyond repair)
UNDER_MAINTENANCE → DISPOSED   (beyond repair)

LOST → AVAILABLE               (found again)
LOST → DISPOSED                (write-off)

RETIRED → DISPOSED             (final disposal)
```

Create a utility:
```typescript
// src/utils/assetLifecycle.ts
export function isValidTransition(from: AssetStatus, to: AssetStatus): boolean
export function getValidTransitions(status: AssetStatus): AssetStatus[]
```

---

### Controller — `src/controllers/asset.controller.ts`

```typescript
class AssetController {
  register(req, res, next)      // POST - with optional photo upload
  getAll(req, res, next)        // GET - paginated list
  getById(req, res, next)       // GET /:id
  getByTag(req, res, next)      // GET /tag/:tag
  update(req, res, next)        // PUT /:id
  getHistory(req, res, next)    // GET /:id/history
  getStats(req, res, next)      // GET /stats
  search(req, res, next)        // GET /search
}
```

---

### Routes — `src/routes/asset.routes.ts`

```
GET    /api/assets                → authenticate → getAll
GET    /api/assets/search         → authenticate → search
GET    /api/assets/stats          → authenticate, authorize(ADMIN, ASSET_MANAGER) → getStats
GET    /api/assets/:id            → authenticate → getById
GET    /api/assets/tag/:tag       → authenticate → getByTag
GET    /api/assets/:id/history    → authenticate → getHistory
POST   /api/assets                → authenticate, authorize(ADMIN, ASSET_MANAGER), uploadPhoto, validate → register
PUT    /api/assets/:id            → authenticate, authorize(ADMIN, ASSET_MANAGER), validate → update
```

Note: `search` route must come before `:id` route to avoid conflicts.

---

### API Contracts

**POST `/api/assets`** (multipart/form-data for photo)
```json
{
  "name": "Dell Monitor U2723QE",
  "categoryId": "uuid",
  "departmentId": "uuid",
  "serialNumber": "SN-MON-2025-001",
  "condition": "NEW",
  "location": "IT Dept Floor 2",
  "acquisitionDate": "2025-01-15T00:00:00.000Z",
  "acquisitionCost": 45000,
  "bookable": false
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Asset registered successfully",
  "data": {
    "id": "uuid",
    "assetTag": "AF-000016",
    "name": "Dell Monitor U2723QE",
    "serialNumber": "SN-MON-2025-001",
    "category": { "id": "uuid", "name": "Electronics" },
    "department": { "id": "uuid", "name": "IT Department" },
    "status": "AVAILABLE",
    "condition": "NEW",
    "location": "IT Dept Floor 2",
    "acquisitionDate": "2025-01-15T00:00:00.000Z",
    "acquisitionCost": "45000.00",
    "bookable": false,
    "qrCode": "data:image/png;base64,...",
    "photoUrl": null,
    "createdBy": { "id": "uuid", "name": "Rohit Sharma" }
  }
}
```

**GET `/api/assets/search?search=laptop&status=AVAILABLE&categoryId=uuid&page=1&limit=10`**
```json
{
  "success": true,
  "data": [...],
  "meta": { "page": 1, "limit": 10, "total": 3, "totalPages": 1 }
}
```

**GET `/api/assets/:id/history`**
```json
{
  "success": true,
  "data": {
    "asset": { "id": "uuid", "assetTag": "AF-000001", "name": "Dell Latitude 5540" },
    "allocations": [
      {
        "id": "uuid",
        "allocatedTo": { "name": "Sneha Reddy" },
        "allocatedBy": { "name": "Rohit Sharma" },
        "allocationDate": "2025-01-15T00:00:00.000Z",
        "status": "ACTIVE"
      }
    ],
    "maintenance": [...],
    "audits": [...],
    "bookings": [...]
  }
}
```

---

### Register Routes in App

Update `src/app.ts`:
```typescript
import { assetRouter } from './routes/asset.routes';
app.use('/api/assets', assetRouter);
```

---

## Verification

```bash
# Register a new asset
curl -X POST http://localhost:5000/api/assets \
  -H "Authorization: Bearer <asset-manager-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Laptop","categoryId":"<cat-uuid>","condition":"NEW","location":"Storage"}'

# Search assets
curl "http://localhost:5000/api/assets/search?search=laptop&status=AVAILABLE" \
  -H "Authorization: Bearer <token>"

# Get asset history
curl http://localhost:5000/api/assets/<asset-id>/history \
  -H "Authorization: Bearer <token>"

# Get stats
curl http://localhost:5000/api/assets/stats \
  -H "Authorization: Bearer <admin-token>"
```

Expected:
- New asset gets auto-generated tag (AF-000016) and QR code
- Search returns filtered, paginated results
- History shows allocation + maintenance timeline
- Stats show counts grouped by status/category/department

---

## What's Next
Prompt 08 will build the Allocation & Transfer Service (allocate, return, transfer with conflict handling).
