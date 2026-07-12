# Prompt 08 — Allocation & Transfer Service

## Context
You are building **AssetFlow**. Assets can now be registered (Prompt 07). Now build the allocation system — assigning assets to employees/departments, handling conflicts, processing transfer requests, and managing returns.

---

## What to Build

### Validation Schemas — `src/validators/allocation.validator.ts`

```typescript
export const allocateAssetSchema = z.object({
  assetId: z.string().uuid(),
  allocatedToId: z.string().uuid(),
  expectedReturn: z.string().datetime().optional().nullable(),
  notes: z.string().optional(),
});

export const returnAssetSchema = z.object({
  returnCondition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']),
  returnNotes: z.string().optional(),
});

export const transferRequestSchema = z.object({
  assetId: z.string().uuid(),
  toUserId: z.string().uuid(),
  reason: z.string().min(5, 'Reason is required'),
});

export const resolveTransferSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});
```

---

### Repository — `src/repositories/allocation.repository.ts`

```typescript
class AllocationRepository {
  // Allocations
  findActiveByAsset(assetId: string)          // find ACTIVE allocation for an asset
  findAllByAsset(assetId: string)             // full allocation history for an asset
  findAllByUser(userId: string)               // all assets allocated to a user
  findOverdue()                               // active allocations past expectedReturn
  create(data)                                // create allocation record
  update(id: string, data)                    // update allocation
  markReturned(id: string, condition, notes)  // set status=RETURNED, returnedDate=now()
  
  // Transfer Requests
  findTransferById(id: string)
  findPendingTransfers()                      // all PENDING transfers
  findTransfersByAsset(assetId: string)
  createTransfer(data)
  updateTransfer(id: string, data)
  
  // Stats
  getOverdueCount()
  getPendingTransferCount()
  getActiveAllocationCount()
}
```

---

### Service — `src/services/allocation.service.ts`

#### `allocateAsset(data, allocatedById)`

**This is the most important business logic in the system.**

1. Validate asset exists → throw if not found
2. Check asset status:
   - If `AVAILABLE` → proceed with allocation
   - If `ALLOCATED` → **CONFLICT!**
     - Find who currently holds it
     - Return error with holder info: `"Asset is currently allocated to {name} ({employeeCode}). Use Transfer Request instead."`
     - Include the current holder's details in the error response so the frontend can show the Transfer button
   - If `UNDER_MAINTENANCE`, `LOST`, `RETIRED`, `DISPOSED` → reject with appropriate message
3. Validate `allocatedToId` user exists and is ACTIVE
4. Create `AssetAllocation` record with status = `ACTIVE`
5. Update asset status to `ALLOCATED`
6. Create notification for the allocated user: "Asset {assetTag} ({name}) has been allocated to you"
7. Log activity
8. Return allocation with asset and user details

#### `returnAsset(allocationId, returnData, userId)`
1. Find allocation → throw if not found
2. Validate allocation is `ACTIVE` → throw if already returned
3. Update allocation: `status = RETURNED`, `returnedDate = now()`, capture condition + notes
4. Update asset status to `AVAILABLE`
5. Update asset condition based on `returnCondition`
6. Create notification for the asset manager: "Asset {assetTag} has been returned by {name}"
7. Log activity
8. Return updated allocation

#### `requestTransfer(data, requestedByUserId)`
1. Validate asset exists
2. Validate asset is currently `ALLOCATED`
3. Find current allocation to get the `fromUser`
4. Validate `toUserId` exists and is ACTIVE
5. Check for existing PENDING transfer for this asset → throw if duplicate
6. Create `TransferRequest` with status = `PENDING`
7. Create notification for Asset Manager/Department Head: "Transfer request for {assetTag} from {fromUser} to {toUser}"
8. Log activity
9. Return transfer request

#### `resolveTransfer(transferId, status, approvedByUserId)`
1. Find transfer → throw if not found
2. Validate transfer is `PENDING`
3. If `APPROVED`:
   - Find current active allocation → mark as `TRANSFERRED`
   - Create new allocation for `toUser`
   - Update asset (stays `ALLOCATED`)
   - Create notification for both users
4. If `REJECTED`:
   - Update transfer status
   - Create notification for requester
5. Log activity
6. Return updated transfer

#### `getMyAllocations(userId)`
1. Return all active allocations for the user with asset details

#### `getAllAllocations(params)`
1. Paginated list of all allocations with filters (status, department, user)

#### `getOverdueAllocations()`
1. Find all active allocations where `expectedReturn < now()`
2. Include asset and user details
3. Return list

#### `getPendingTransfers()`
1. Return all PENDING transfer requests with asset + user details

---

### Controller — `src/controllers/allocation.controller.ts`

```typescript
class AllocationController {
  allocate(req, res, next)           // POST /allocate
  returnAsset(req, res, next)        // PATCH /:id/return
  requestTransfer(req, res, next)    // POST /transfer
  resolveTransfer(req, res, next)    // PATCH /transfer/:id/resolve
  getMyAllocations(req, res, next)   // GET /my
  getAllAllocations(req, res, next)   // GET /
  getOverdue(req, res, next)         // GET /overdue
  getPendingTransfers(req, res, next)// GET /transfers/pending
}
```

---

### Routes — `src/routes/allocation.routes.ts`

```
GET    /api/allocations              → authenticate, authorize(ADMIN, ASSET_MANAGER) → getAll
GET    /api/allocations/my           → authenticate → getMyAllocations
GET    /api/allocations/overdue      → authenticate, authorize(ADMIN, ASSET_MANAGER) → getOverdue
GET    /api/allocations/transfers/pending → authenticate, authorize(ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD) → getPendingTransfers
POST   /api/allocations/allocate     → authenticate, authorize(ADMIN, ASSET_MANAGER), validate → allocate
PATCH  /api/allocations/:id/return   → authenticate, validate(returnAssetSchema) → returnAsset
POST   /api/allocations/transfer     → authenticate, validate(transferRequestSchema) → requestTransfer
PATCH  /api/allocations/transfer/:id/resolve → authenticate, authorize(ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD), validate(resolveTransferSchema) → resolveTransfer
```

---

### API Contracts

**POST `/api/allocations/allocate`**
```json
{
  "assetId": "uuid",
  "allocatedToId": "uuid",
  "expectedReturn": "2025-08-15T00:00:00.000Z",
  "notes": "For project X development"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Asset allocated successfully",
  "data": {
    "id": "uuid",
    "asset": { "assetTag": "AF-000003", "name": "HP EliteDesk 800" },
    "allocatedTo": { "name": "Raj Malhotra", "employeeCode": "EMP-006" },
    "allocatedBy": { "name": "Rohit Sharma" },
    "allocationDate": "2025-07-12T00:00:00.000Z",
    "expectedReturn": "2025-08-15T00:00:00.000Z",
    "status": "ACTIVE"
  }
}
```

**Conflict Response (409):**
```json
{
  "success": false,
  "message": "Asset AF-000001 is currently allocated to Sneha Reddy (EMP-005). Use Transfer Request instead.",
  "data": {
    "currentHolder": {
      "id": "uuid",
      "name": "Sneha Reddy",
      "employeeCode": "EMP-005",
      "email": "sneha@assetflow.com"
    },
    "allocationId": "uuid",
    "allocatedSince": "2025-01-15T00:00:00.000Z"
  }
}
```

**PATCH `/api/allocations/:id/return`**
```json
{
  "returnCondition": "GOOD",
  "returnNotes": "Minor scratches on lid, otherwise functional"
}
```

**POST `/api/allocations/transfer`**
```json
{
  "assetId": "uuid",
  "toUserId": "uuid",
  "reason": "Sneha has moved to Backend Team and no longer needs this laptop"
}
```

**GET `/api/allocations/overdue`**
```json
{
  "success": true,
  "message": "Overdue allocations retrieved",
  "data": [
    {
      "id": "uuid",
      "asset": { "assetTag": "AF-000002", "name": "MacBook Pro 16\"" },
      "allocatedTo": { "name": "Raj Malhotra", "employeeCode": "EMP-006" },
      "expectedReturn": "2025-06-27T00:00:00.000Z",
      "daysOverdue": 15
    }
  ]
}
```

---

### Register Routes in App

Update `src/app.ts`:
```typescript
import { allocationRouter } from './routes/allocation.routes';
app.use('/api/allocations', allocationRouter);
```

---

## Business Rules

1. **No double allocation**: An asset can have only ONE active allocation. Attempting to allocate an already-allocated asset returns 409 with current holder info.
2. **Transfer workflow**: When a 409 conflict occurs, the frontend shows a "Request Transfer" button. The transfer goes through approval before re-allocation.
3. **Return updates asset**: Returning an asset sets its status back to `AVAILABLE` and captures the return condition.
4. **Overdue auto-flagging**: Allocations past their `expectedReturn` date are flagged as overdue. The overdue list feeds the Dashboard and Notifications.
5. **Transfer approval chain**: Asset Manager or Department Head can approve/reject transfers.
6. **Activity trail**: Every allocation, return, transfer request, and resolution is logged.

---

## Verification

```bash
# Allocate an available asset
curl -X POST http://localhost:5000/api/allocations/allocate \
  -H "Authorization: Bearer <asset-manager-token>" \
  -H "Content-Type: application/json" \
  -d '{"assetId":"<available-asset-uuid>","allocatedToId":"<user-uuid>"}'

# Try to allocate an already-allocated asset (should get 409)
curl -X POST http://localhost:5000/api/allocations/allocate \
  -H "Authorization: Bearer <asset-manager-token>" \
  -H "Content-Type: application/json" \
  -d '{"assetId":"<allocated-asset-uuid>","allocatedToId":"<other-user-uuid>"}'

# Get overdue allocations
curl http://localhost:5000/api/allocations/overdue \
  -H "Authorization: Bearer <asset-manager-token>"

# Return an asset
curl -X PATCH http://localhost:5000/api/allocations/<allocation-id>/return \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"returnCondition":"GOOD","returnNotes":"All good"}'
```

---

## What's Next
Prompt 09 will build the Resource Booking Service (time-slot booking with overlap validation).
