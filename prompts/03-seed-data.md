# Prompt 03 — Seed Data

## Context
You are building **AssetFlow**. The Prisma schema (Prompt 02) is complete with all 14 models. Now create a comprehensive seed script that populates the database with realistic demo data so every screen has something to show.

---

## What to Build

Create `assetflow/backend/prisma/seed.ts`

Also update `assetflow/backend/package.json` to add:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

## Seed Script Requirements

### 1. Roles / Users (8 users)

| Name | Email | Role | Department | Password |
|------|-------|------|------------|----------|
| Admin User | admin@assetflow.com | ADMIN | — | admin123 |
| Rohit Sharma | rohit@assetflow.com | ASSET_MANAGER | IT Department | password123 |
| Priya Patel | priya@assetflow.com | DEPARTMENT_HEAD | IT Department | password123 |
| Amit Kumar | amit@assetflow.com | DEPARTMENT_HEAD | HR Department | password123 |
| Sneha Reddy | sneha@assetflow.com | EMPLOYEE | IT Department | password123 |
| Raj Malhotra | raj@assetflow.com | EMPLOYEE | IT Department | password123 |
| Ananya Singh | ananya@assetflow.com | EMPLOYEE | HR Department | password123 |
| Vikram Desai | vikram@assetflow.com | EMPLOYEE | Operations | password123 |

All passwords must be hashed with bcrypt.

Employee codes: `EMP-001` through `EMP-008`.

### 2. Departments (5)

| Department | Parent | Head | Status |
|-----------|--------|------|--------|
| IT Department | — | Priya Patel | ACTIVE |
| HR Department | — | Amit Kumar | ACTIVE |
| Operations | — | — | ACTIVE |
| Frontend Team | IT Department | — | ACTIVE |
| Backend Team | IT Department | — | ACTIVE |

### 3. Categories (6)

| Category | Warranty (months) | Description |
|----------|-------------------|-------------|
| Electronics | 24 | Laptops, desktops, monitors, peripherals |
| Furniture | 60 | Desks, chairs, cabinets, shelving |
| Vehicles | 36 | Company cars, vans, delivery vehicles |
| Conference Rooms | — | Meeting rooms, board rooms |
| Lab Equipment | 12 | Testing devices, measurement tools |
| Office Supplies | — | Printers, projectors, whiteboards |

### 4. Assets (15+)

Create a mix of assets across categories with different statuses:

| Asset Tag | Name | Category | Status | Bookable | Location |
|-----------|------|----------|--------|----------|----------|
| AF-000001 | Dell Latitude 5540 | Electronics | ALLOCATED | false | IT Dept Floor 2 |
| AF-000002 | MacBook Pro 16" | Electronics | ALLOCATED | false | IT Dept Floor 2 |
| AF-000003 | HP EliteDesk 800 | Electronics | AVAILABLE | false | Storage Room A |
| AF-000004 | ThinkPad X1 Carbon | Electronics | UNDER_MAINTENANCE | false | IT Dept Floor 2 |
| AF-000005 | Samsung Monitor 27" | Electronics | AVAILABLE | false | Storage Room A |
| AF-000006 | Ergonomic Chair Herman Miller | Furniture | ALLOCATED | false | IT Dept Floor 2 |
| AF-000007 | Standing Desk VariDesk | Furniture | AVAILABLE | false | Storage Room B |
| AF-000008 | Toyota Innova KA-01-AB-1234 | Vehicles | AVAILABLE | true | Parking Lot A |
| AF-000009 | Conference Room B2 | Conference Rooms | AVAILABLE | true | Floor 2, Block B |
| AF-000010 | Conference Room A1 | Conference Rooms | AVAILABLE | true | Floor 1, Block A |
| AF-000011 | Board Room | Conference Rooms | AVAILABLE | true | Floor 3, Executive |
| AF-000012 | Epson Projector EB-X51 | Office Supplies | AVAILABLE | true | AV Storage |
| AF-000013 | Oscilloscope Keysight | Lab Equipment | ALLOCATED | false | Lab Floor 1 |
| AF-000014 | HP LaserJet Pro | Office Supplies | AVAILABLE | true | Print Room Floor 2 |
| AF-000015 | Ford EcoSport KA-01-CD-5678 | Vehicles | AVAILABLE | true | Parking Lot A |

Set `acquisitionCost` and `acquisitionDate` with realistic values. Assign `createdById` to the Asset Manager (Rohit).

### 5. Asset Allocations (4)

| Asset | Allocated To | Expected Return | Status |
|-------|-------------|-----------------|--------|
| AF-000001 (Dell Latitude) | Sneha Reddy | 30 days from now | ACTIVE |
| AF-000002 (MacBook Pro) | Raj Malhotra | 15 days ago (OVERDUE!) | ACTIVE |
| AF-000006 (Chair) | Priya Patel | — (permanent) | ACTIVE |
| AF-000013 (Oscilloscope) | Vikram Desai | 7 days from now | ACTIVE |

**Important:** AF-000002 must have an expected return date in the past to demonstrate overdue alerts.

### 6. Transfer Requests (2)

| Asset | From | To | Status |
|-------|------|----|--------|
| AF-000001 | Sneha Reddy | Raj Malhotra | PENDING |
| AF-000002 | Raj Malhotra | Ananya Singh | PENDING |

### 7. Bookings (5)

Create bookings for bookable assets (rooms, vehicles, projector):

| Asset | Booked By | Start | End | Status |
|-------|-----------|-------|-----|--------|
| Conf Room B2 | Priya | Tomorrow 9:00 | Tomorrow 10:00 | UPCOMING |
| Conf Room B2 | Amit | Tomorrow 10:00 | Tomorrow 11:30 | UPCOMING |
| Conf Room A1 | Sneha | Today 14:00 | Today 15:00 | ONGOING (if current time is in range) |
| Board Room | Admin | Yesterday 10:00 | Yesterday 12:00 | COMPLETED |
| Toyota Innova | Vikram | Day after tomorrow 8:00 | Day after tomorrow 18:00 | UPCOMING |

### 8. Maintenance Requests (3)

| Asset | Raised By | Priority | Status | Issue |
|-------|-----------|----------|--------|-------|
| AF-000004 (ThinkPad) | Sneha | HIGH | APPROVED | Screen flickering intermittently, may need display replacement |
| AF-000003 (HP EliteDesk) | Raj | LOW | PENDING | USB-C port not working |
| AF-000012 (Projector) | Amit | MEDIUM | RESOLVED | Bulb replaced, lamp hours reset |

For the RESOLVED request, set `resolvedAt` to 3 days ago.

### 9. Audit Cycle (1)

Create one audit cycle:
- Title: "Q3 2025 IT Asset Audit"
- Department: IT Department
- Status: IN_PROGRESS
- Date range: last week to next week
- Created by: Admin

With audit items:
| Asset | Auditor | Verification |
|-------|---------|--------------|
| AF-000001 | Rohit | VERIFIED |
| AF-000002 | Rohit | VERIFIED |
| AF-000003 | Rohit | PENDING |
| AF-000004 | Rohit | DAMAGED |
| AF-000005 | Rohit | PENDING |

### 10. Notifications (8+)

Create sample notifications for different users:
- "Asset AF-000001 has been allocated to you" → Sneha (read)
- "MacBook Pro AF-000002 return is overdue" → Raj (unread)
- "Transfer request pending for Dell Latitude AF-000001" → Rohit (unread)
- "Maintenance request approved for ThinkPad AF-000004" → Sneha (read)
- "Booking confirmed: Conference Room B2 tomorrow 9:00-10:00" → Priya (unread)
- "New maintenance request pending approval" → Rohit (unread)
- "Audit cycle Q3 IT Asset Audit has started" → Rohit (read)
- "Overdue return alert: MacBook Pro AF-000002" → Admin (unread)

### 11. Activity Logs (10+)

Create realistic activity log entries:
```
Admin created Department "IT Department"
Admin created Department "HR Department"
Admin promoted Priya Patel to DEPARTMENT_HEAD
Admin promoted Rohit Sharma to ASSET_MANAGER
Rohit registered asset AF-000001 (Dell Latitude 5540)
Rohit allocated AF-000001 to Sneha Reddy
Sneha raised maintenance request for AF-000004
Rohit approved maintenance for AF-000004
Priya booked Conference Room B2
Admin created Audit Cycle "Q3 2025 IT Asset Audit"
```

---

## Script Structure

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AssetFlow database...');

  // Clear existing data (in reverse dependency order)
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditItem.deleteMany();
  await prisma.auditCycle.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.transferRequest.deleteMany();
  await prisma.assetAllocation.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // 1. Create departments
  // 2. Create users (with hashed passwords)
  // 3. Update department heads
  // 4. Create categories
  // 5. Create assets
  // 6. Create allocations + update asset statuses
  // 7. Create transfer requests
  // 8. Create bookings
  // 9. Create maintenance requests
  // 10. Create audit cycle + items
  // 11. Create notifications
  // 12. Create activity logs

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## Business Rules to Enforce in Seed Data

1. **Password hashing**: Use `bcrypt.hashSync(password, 10)` for all passwords.
2. **Asset status consistency**: If an asset has an ACTIVE allocation, its status must be ALLOCATED.
3. **Overdue data**: At least one allocation must have `expectedReturn` in the past to test overdue alerts.
4. **Booking times**: Use `new Date()` arithmetic to create relative dates (tomorrow, yesterday, etc.).
5. **Asset tags**: Must follow the `AF-XXXXXX` pattern exactly.

---

## Verification

Run:
```bash
cd assetflow/backend
npx prisma db seed
```

Then verify with:
```bash
npx prisma studio
```

Check:
- 8 users with correct roles
- 5 departments with hierarchy (Frontend Team → IT Department)
- 6 categories
- 15 assets with mixed statuses
- 4 active allocations (1 overdue)
- 2 pending transfer requests
- 5 bookings with different statuses
- 3 maintenance requests
- 1 audit cycle with 5 items
- 8+ notifications
- 10+ activity logs

---

## What's Next
Prompt 04 will build the backend core — Express app configuration, middleware stack, JWT utilities, and error handling.
