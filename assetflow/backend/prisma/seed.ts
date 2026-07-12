import { PrismaClient, UserRole, UserStatus, DepartmentStatus, CategoryStatus, AssetStatus, AssetCondition, AllocationStatus, TransferStatus, BookingStatus, MaintenancePriority, MaintenanceStatus, AuditCycleStatus, AuditVerification } from '@prisma/client';
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
  // Clear department circular heads first
  await prisma.department.updateMany({ data: { headId: null } });
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // Helper to hash password
  const hashPassword = (password: string) => bcrypt.hashSync(password, 10);

  // 1. Create departments
  const itDept = await prisma.department.create({
    data: {
      name: 'IT Department',
      description: 'Information Technology and Services',
      status: DepartmentStatus.ACTIVE,
    },
  });

  const hrDept = await prisma.department.create({
    data: {
      name: 'HR Department',
      description: 'Human Resources and Talent Acquisition',
      status: DepartmentStatus.ACTIVE,
    },
  });

  const opsDept = await prisma.department.create({
    data: {
      name: 'Operations',
      description: 'Company operations and logistics',
      status: DepartmentStatus.ACTIVE,
    },
  });

  const frontendTeam = await prisma.department.create({
    data: {
      name: 'Frontend Team',
      description: 'Client-side web development',
      parentId: itDept.id,
      status: DepartmentStatus.ACTIVE,
    },
  });

  const backendTeam = await prisma.department.create({
    data: {
      name: 'Backend Team',
      description: 'Server-side API and database engineering',
      parentId: itDept.id,
      status: DepartmentStatus.ACTIVE,
    },
  });

  // 2. Create users (8 users)
  const admin = await prisma.user.create({
    data: {
      employeeCode: 'EMP-001',
      name: 'Admin User',
      email: 'admin@assetflow.com',
      password: hashPassword('admin123'),
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const rohit = await prisma.user.create({
    data: {
      employeeCode: 'EMP-002',
      name: 'Rohit Sharma',
      email: 'rohit@assetflow.com',
      password: hashPassword('password123'),
      role: UserRole.ASSET_MANAGER,
      status: UserStatus.ACTIVE,
      departmentId: itDept.id,
    },
  });

  const priya = await prisma.user.create({
    data: {
      employeeCode: 'EMP-003',
      name: 'Priya Patel',
      email: 'priya@assetflow.com',
      password: hashPassword('password123'),
      role: UserRole.DEPARTMENT_HEAD,
      status: UserStatus.ACTIVE,
      departmentId: itDept.id,
    },
  });

  const amit = await prisma.user.create({
    data: {
      employeeCode: 'EMP-004',
      name: 'Amit Kumar',
      email: 'amit@assetflow.com',
      password: hashPassword('password123'),
      role: UserRole.DEPARTMENT_HEAD,
      status: UserStatus.ACTIVE,
      departmentId: hrDept.id,
    },
  });

  const sneha = await prisma.user.create({
    data: {
      employeeCode: 'EMP-005',
      name: 'Sneha Reddy',
      email: 'sneha@assetflow.com',
      password: hashPassword('password123'),
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
      departmentId: itDept.id,
    },
  });

  const raj = await prisma.user.create({
    data: {
      employeeCode: 'EMP-006',
      name: 'Raj Malhotra',
      email: 'raj@assetflow.com',
      password: hashPassword('password123'),
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
      departmentId: itDept.id,
    },
  });

  const ananya = await prisma.user.create({
    data: {
      employeeCode: 'EMP-007',
      name: 'Ananya Singh',
      email: 'ananya@assetflow.com',
      password: hashPassword('password123'),
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
      departmentId: hrDept.id,
    },
  });

  const vikram = await prisma.user.create({
    data: {
      employeeCode: 'EMP-008',
      name: 'Vikram Desai',
      email: 'vikram@assetflow.com',
      password: hashPassword('password123'),
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
      departmentId: opsDept.id,
    },
  });

  // 3. Update department heads
  await prisma.department.update({
    where: { id: itDept.id },
    data: { headId: priya.id },
  });

  await prisma.department.update({
    where: { id: hrDept.id },
    data: { headId: amit.id },
  });

  // 4. Create categories
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      description: 'Laptops, desktops, monitors, peripherals',
      warrantyPeriod: 24,
      status: CategoryStatus.ACTIVE,
    },
  });

  const furniture = await prisma.category.create({
    data: {
      name: 'Furniture',
      description: 'Desks, chairs, cabinets, shelving',
      warrantyPeriod: 60,
      status: CategoryStatus.ACTIVE,
    },
  });

  const vehicles = await prisma.category.create({
    data: {
      name: 'Vehicles',
      description: 'Company cars, vans, delivery vehicles',
      warrantyPeriod: 36,
      status: CategoryStatus.ACTIVE,
    },
  });

  const confRooms = await prisma.category.create({
    data: {
      name: 'Conference Rooms',
      description: 'Meeting rooms, board rooms',
      status: CategoryStatus.ACTIVE,
    },
  });

  const labEquip = await prisma.category.create({
    data: {
      name: 'Lab Equipment',
      description: 'Testing devices, measurement tools',
      warrantyPeriod: 12,
      status: CategoryStatus.ACTIVE,
    },
  });

  const officeSupplies = await prisma.category.create({
    data: {
      name: 'Office Supplies',
      description: 'Printers, projectors, whiteboards',
      status: CategoryStatus.ACTIVE,
    },
  });

  // 5. Create assets (15 assets)
  const assetData = [
    { tag: 'AF-000001', name: 'Dell Latitude 5540', catId: electronics.id, deptId: itDept.id, status: AssetStatus.ALLOCATED, bookable: false, loc: 'IT Dept Floor 2' },
    { tag: 'AF-000002', name: 'MacBook Pro 16"', catId: electronics.id, deptId: itDept.id, status: AssetStatus.ALLOCATED, bookable: false, loc: 'IT Dept Floor 2' },
    { tag: 'AF-000003', name: 'HP EliteDesk 800', catId: electronics.id, deptId: itDept.id, status: AssetStatus.AVAILABLE, bookable: false, loc: 'Storage Room A' },
    { tag: 'AF-000004', name: 'ThinkPad X1 Carbon', catId: electronics.id, deptId: itDept.id, status: AssetStatus.UNDER_MAINTENANCE, bookable: false, loc: 'IT Dept Floor 2' },
    { tag: 'AF-000005', name: 'Samsung Monitor 27"', catId: electronics.id, deptId: itDept.id, status: AssetStatus.AVAILABLE, bookable: false, loc: 'Storage Room A' },
    { tag: 'AF-000006', name: 'Ergonomic Chair Herman Miller', catId: furniture.id, deptId: itDept.id, status: AssetStatus.ALLOCATED, bookable: false, loc: 'IT Dept Floor 2' },
    { tag: 'AF-000007', name: 'Standing Desk VariDesk', catId: furniture.id, deptId: itDept.id, status: AssetStatus.AVAILABLE, bookable: false, loc: 'Storage Room B' },
    { tag: 'AF-000008', name: 'Toyota Innova KA-01-AB-1234', catId: vehicles.id, deptId: opsDept.id, status: AssetStatus.AVAILABLE, bookable: true, loc: 'Parking Lot A' },
    { tag: 'AF-000009', name: 'Conference Room B2', catId: confRooms.id, deptId: itDept.id, status: AssetStatus.AVAILABLE, bookable: true, loc: 'Floor 2, Block B' },
    { tag: 'AF-000010', name: 'Conference Room A1', catId: confRooms.id, deptId: itDept.id, status: AssetStatus.AVAILABLE, bookable: true, loc: 'Floor 1, Block A' },
    { tag: 'AF-000011', name: 'Board Room', catId: confRooms.id, deptId: itDept.id, status: AssetStatus.AVAILABLE, bookable: true, loc: 'Floor 3, Executive' },
    { tag: 'AF-000012', name: 'Epson Projector EB-X51', catId: officeSupplies.id, deptId: itDept.id, status: AssetStatus.AVAILABLE, bookable: true, loc: 'AV Storage' },
    { tag: 'AF-000013', name: 'Oscilloscope Keysight', catId: labEquip.id, deptId: itDept.id, status: AssetStatus.ALLOCATED, bookable: false, loc: 'Lab Floor 1' },
    { tag: 'AF-000014', name: 'HP LaserJet Pro', catId: officeSupplies.id, deptId: itDept.id, status: AssetStatus.AVAILABLE, bookable: true, loc: 'Print Room Floor 2' },
    { tag: 'AF-000015', name: 'Ford EcoSport KA-01-CD-5678', catId: vehicles.id, deptId: opsDept.id, status: AssetStatus.AVAILABLE, bookable: true, loc: 'Parking Lot A' },
  ];

  const createdAssets: Record<string, any> = {};

  for (const data of assetData) {
    const a = await prisma.asset.create({
      data: {
        assetTag: data.tag,
        name: data.name,
        categoryId: data.catId,
        departmentId: data.deptId,
        status: data.status,
        bookable: data.bookable,
        location: data.loc,
        condition: AssetCondition.GOOD,
        acquisitionCost: 50000,
        acquisitionDate: new Date(),
        createdById: rohit.id,
      },
    });
    createdAssets[data.tag] = a;
  }

  // 6. Create allocations (4 allocations)
  const now = new Date();
  
  const alloc1 = await prisma.assetAllocation.create({
    data: {
      assetId: createdAssets['AF-000001'].id,
      allocatedToId: sneha.id,
      allocatedById: rohit.id,
      allocationDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      expectedReturn: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: AllocationStatus.ACTIVE,
    },
  });

  // Overdue allocation
  const alloc2 = await prisma.assetAllocation.create({
    data: {
      assetId: createdAssets['AF-000002'].id,
      allocatedToId: raj.id,
      allocatedById: rohit.id,
      allocationDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      expectedReturn: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago (OVERDUE!)
      status: AllocationStatus.ACTIVE,
    },
  });

  const alloc3 = await prisma.assetAllocation.create({
    data: {
      assetId: createdAssets['AF-000006'].id,
      allocatedToId: priya.id,
      allocatedById: rohit.id,
      allocationDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      expectedReturn: null, // permanent
      status: AllocationStatus.ACTIVE,
    },
  });

  const alloc4 = await prisma.assetAllocation.create({
    data: {
      assetId: createdAssets['AF-000013'].id,
      allocatedToId: vikram.id,
      allocatedById: rohit.id,
      allocationDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      expectedReturn: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: AllocationStatus.ACTIVE,
    },
  });

  // 7. Create transfer requests
  await prisma.transferRequest.create({
    data: {
      assetId: createdAssets['AF-000001'].id,
      fromUserId: sneha.id,
      toUserId: raj.id,
      reason: 'Raj needs it for temporary design testing',
      status: TransferStatus.PENDING,
    },
  });

  await prisma.transferRequest.create({
    data: {
      assetId: createdAssets['AF-000002'].id,
      fromUserId: raj.id,
      toUserId: ananya.id,
      reason: 'Ananya needs a Mac for iOS building',
      status: TransferStatus.PENDING,
    },
  });

  // 8. Create bookings
  await prisma.booking.create({
    data: {
      assetId: createdAssets['AF-000009'].id, // Room B2
      bookedById: priya.id,
      startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow 24h from now
      endTime: new Date(now.getTime() + 25 * 60 * 60 * 1000), // Tomorrow 25h from now
      purpose: 'Sprint planning meeting',
      status: BookingStatus.UPCOMING,
    },
  });

  await prisma.booking.create({
    data: {
      assetId: createdAssets['AF-000009'].id, // Room B2
      bookedById: amit.id,
      startTime: new Date(now.getTime() + 25 * 60 * 60 * 1000), // Tomorrow 25h
      endTime: new Date(now.getTime() + 26.5 * 60 * 60 * 1000), // Tomorrow 26.5h
      purpose: 'HR review and catchup',
      status: BookingStatus.UPCOMING,
    },
  });

  await prisma.booking.create({
    data: {
      assetId: createdAssets['AF-000010'].id, // Room A1
      bookedById: sneha.id,
      startTime: new Date(now.getTime() - 30 * 60 * 1000), // 30 mins ago
      endTime: new Date(now.getTime() + 30 * 60 * 1000), // 30 mins from now
      purpose: 'Daily standup call',
      status: BookingStatus.ONGOING,
    },
  });

  await prisma.booking.create({
    data: {
      assetId: createdAssets['AF-000011'].id, // Board Room
      bookedById: admin.id,
      startTime: new Date(now.getTime() - 26 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      purpose: 'Executive board update',
      status: BookingStatus.COMPLETED,
    },
  });

  await prisma.booking.create({
    data: {
      assetId: createdAssets['AF-000008'].id, // Toyota Innova
      bookedById: vikram.id,
      startTime: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() + 58 * 60 * 60 * 1000),
      purpose: 'Onsite customer visit',
      status: BookingStatus.UPCOMING,
    },
  });

  // 9. Create maintenance requests
  await prisma.maintenanceRequest.create({
    data: {
      assetId: createdAssets['AF-000004'].id, // ThinkPad
      raisedById: sneha.id,
      priority: MaintenancePriority.HIGH,
      status: MaintenanceStatus.APPROVED,
      issue: 'Screen flickering intermittently, may need display replacement',
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      assetId: createdAssets['AF-000003'].id, // HP EliteDesk
      raisedById: raj.id,
      priority: MaintenancePriority.LOW,
      status: MaintenanceStatus.PENDING,
      issue: 'USB-C port not working',
    },
  });

  await prisma.maintenanceRequest.create({
    data: {
      assetId: createdAssets['AF-000012'].id, // Projector
      raisedById: amit.id,
      priority: MaintenancePriority.MEDIUM,
      status: MaintenanceStatus.RESOLVED,
      issue: 'Bulb replaced, lamp hours reset',
      resolvedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      resolutionNotes: 'Bulb swapped with original spare and cleaned air filter.',
    },
  });

  // 10. Create audit cycle
  const auditCycle = await prisma.auditCycle.create({
    data: {
      title: 'Q3 2025 IT Asset Audit',
      departmentId: itDept.id,
      status: AuditCycleStatus.IN_PROGRESS,
      startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // last week
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // next week
      createdById: admin.id,
    },
  });

  await prisma.auditItem.create({
    data: {
      auditCycleId: auditCycle.id,
      assetId: createdAssets['AF-000001'].id,
      auditorId: rohit.id,
      verification: AuditVerification.VERIFIED,
      remarks: 'Found in use at desk 4B',
      verifiedAt: now,
    },
  });

  await prisma.auditItem.create({
    data: {
      auditCycleId: auditCycle.id,
      assetId: createdAssets['AF-000002'].id,
      auditorId: rohit.id,
      verification: AuditVerification.VERIFIED,
      remarks: 'Found in use, good condition',
      verifiedAt: now,
    },
  });

  await prisma.auditItem.create({
    data: {
      auditCycleId: auditCycle.id,
      assetId: createdAssets['AF-000003'].id,
      auditorId: rohit.id,
      verification: AuditVerification.PENDING,
    },
  });

  await prisma.auditItem.create({
    data: {
      auditCycleId: auditCycle.id,
      assetId: createdAssets['AF-000004'].id,
      auditorId: rohit.id,
      verification: AuditVerification.DAMAGED,
      remarks: 'Screen flicker verified, screen border chipped',
      verifiedAt: now,
    },
  });

  await prisma.auditItem.create({
    data: {
      auditCycleId: auditCycle.id,
      assetId: createdAssets['AF-000005'].id,
      auditorId: rohit.id,
      verification: AuditVerification.PENDING,
    },
  });

  // 11. Create notifications
  const notificationList = [
    { uId: sneha.id, title: 'Asset Allocated', msg: 'Asset AF-000001 has been allocated to you', type: 'ASSET_ASSIGNED', read: true },
    { uId: raj.id, title: 'Asset Return Overdue', msg: 'MacBook Pro AF-000002 return is overdue', type: 'OVERDUE_RETURN', read: false },
    { uId: rohit.id, title: 'Pending Transfer Request', msg: 'Transfer request pending for Dell Latitude AF-000001', type: 'TRANSFER_REQUESTED', read: false },
    { uId: sneha.id, title: 'Maintenance Approved', msg: 'Maintenance request approved for ThinkPad AF-000004', type: 'MAINTENANCE_APPROVED', read: true },
    { uId: priya.id, title: 'Booking Confirmed', msg: 'Booking confirmed: Conference Room B2 tomorrow', type: 'BOOKING_CONFIRMED', read: false },
    { uId: rohit.id, title: 'New Maintenance Request', msg: 'New maintenance request pending approval for HP EliteDesk AF-000003', type: 'MAINTENANCE_RAISED', read: false },
    { uId: rohit.id, title: 'Audit Cycle Started', msg: 'Audit cycle Q3 IT Asset Audit has started', type: 'AUDIT_ASSIGNED', read: true },
    { uId: admin.id, title: 'Overdue Return Warning', msg: 'Overdue return alert: MacBook Pro AF-000002 by Raj Malhotra', type: 'OVERDUE_RETURN', read: false },
  ];

  for (const notif of notificationList) {
    await prisma.notification.create({
      data: {
        userId: notif.uId,
        title: notif.title,
        message: notif.msg,
        type: notif.type,
        isRead: notif.read,
      },
    });
  }

  // 12. Create activity logs
  const activityList = [
    { uId: admin.id, action: 'CREATE', entity: 'Department', id: itDept.id, detail: { name: 'IT Department' } },
    { uId: admin.id, action: 'CREATE', entity: 'Department', id: hrDept.id, detail: { name: 'HR Department' } },
    { uId: admin.id, action: 'PROMOTE_USER', entity: 'User', id: priya.id, detail: { role: 'DEPARTMENT_HEAD', user: priya.name } },
    { uId: admin.id, action: 'PROMOTE_USER', entity: 'User', id: rohit.id, detail: { role: 'ASSET_MANAGER', user: rohit.name } },
    { uId: rohit.id, action: 'CREATE', entity: 'Asset', id: createdAssets['AF-000001'].id, detail: { tag: 'AF-000001', name: 'Dell Latitude 5540' } },
    { uId: rohit.id, action: 'ALLOCATE', entity: 'AssetAllocation', id: alloc1.id, detail: { tag: 'AF-000001', to: sneha.name } },
    { uId: sneha.id, action: 'RAISE_MAINTENANCE', entity: 'MaintenanceRequest', id: createdAssets['AF-000004'].id, detail: { tag: 'AF-000004', issue: 'Screen flickering' } },
    { uId: rohit.id, action: 'APPROVE_MAINTENANCE', entity: 'MaintenanceRequest', id: createdAssets['AF-000004'].id, detail: { tag: 'AF-000004', status: 'APPROVED' } },
    { uId: priya.id, action: 'BOOK', entity: 'Booking', id: createdAssets['AF-000009'].id, detail: { room: 'Conference Room B2', purpose: 'Sprint planning' } },
    { uId: admin.id, action: 'CREATE_AUDIT', entity: 'AuditCycle', id: auditCycle.id, detail: { title: 'Q3 2025 IT Asset Audit' } },
  ];

  for (const act of activityList) {
    await prisma.activityLog.create({
      data: {
        userId: act.uId,
        action: act.action,
        entity: act.entity,
        entityId: act.id,
        details: act.detail,
      },
    });
  }

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
