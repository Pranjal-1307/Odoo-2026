import prisma from '../config/database';
import { AssetStatus, BookingStatus, MaintenanceStatus, TransferStatus, AllocationStatus } from '@prisma/client';

export class DashboardService {
  async getDashboardKPIs(userId: string, userRole: string) {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get user's department for department head filter
    let departmentId: string | null = null;
    if (userRole === 'DEPARTMENT_HEAD') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { departmentId: true },
      });
      departmentId = user?.departmentId || null;
    }

    // Dynamic where clauses
    let assetWhere: any = {};
    let allocWhere: any = { status: AllocationStatus.ACTIVE };
    let bookingWhere: any = {};
    let transferWhere: any = { status: TransferStatus.PENDING };
    let maintenanceWhere: any = {};
    let employeeWhere: any = {};

    if (userRole === 'DEPARTMENT_HEAD' && departmentId) {
      assetWhere.departmentId = departmentId;
      allocWhere.asset = { departmentId };
      bookingWhere.asset = { departmentId };
      transferWhere.asset = { departmentId };
      maintenanceWhere.asset = { departmentId };
      employeeWhere.departmentId = departmentId;
    } else if (userRole === 'EMPLOYEE') {
      assetWhere.allocations = { some: { allocatedToId: userId, status: AllocationStatus.ACTIVE } };
      allocWhere.allocatedToId = userId;
      bookingWhere.bookedById = userId;
      transferWhere.OR = [{ fromUserId: userId }, { toUserId: userId }];
      maintenanceWhere.raisedById = userId;
      employeeWhere.id = userId;
    }

    // Calculate metrics
    const assetsAvailable = await prisma.asset.count({
      where: { ...assetWhere, status: AssetStatus.AVAILABLE },
    });

    const assetsAllocated = await prisma.asset.count({
      where: { ...assetWhere, status: AssetStatus.ALLOCATED },
    });

    const assetsUnderMaintenance = await prisma.asset.count({
      where: { ...assetWhere, status: AssetStatus.UNDER_MAINTENANCE },
    });

    const maintenanceToday = await prisma.maintenanceRequest.count({
      where: {
        ...maintenanceWhere,
        OR: [
          { createdAt: { gte: startOfToday, lte: endOfToday } },
          { resolvedAt: { gte: startOfToday, lte: endOfToday } },
        ],
      },
    });

    const activeBookings = await prisma.booking.count({
      where: { ...bookingWhere, status: BookingStatus.ONGOING },
    });

    const upcomingBookings = await prisma.booking.count({
      where: { ...bookingWhere, status: BookingStatus.UPCOMING },
    });

    const pendingTransfers = await prisma.transferRequest.count({
      where: transferWhere,
    });

    const upcomingReturns = await prisma.assetAllocation.count({
      where: {
        ...allocWhere,
        expectedReturn: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
    });

    const overdueReturns = await prisma.assetAllocation.count({
      where: {
        ...allocWhere,
        expectedReturn: {
          lt: now,
        },
      },
    });

    const totalAssets = await prisma.asset.count({
      where: assetWhere,
    });

    const totalEmployees = await prisma.user.count({
      where: employeeWhere,
    });

    const pendingMaintenanceRequests = await prisma.maintenanceRequest.count({
      where: { ...maintenanceWhere, status: MaintenanceStatus.PENDING },
    });

    return {
      assetsAvailable,
      assetsAllocated,
      assetsUnderMaintenance,
      maintenanceToday,
      activeBookings,
      upcomingBookings,
      pendingTransfers,
      upcomingReturns,
      overdueReturns,
      totalAssets,
      totalEmployees,
      pendingMaintenanceRequests,
    };
  }

  async getOverdueReturnsList() {
    const now = new Date();
    const overdue = await prisma.assetAllocation.findMany({
      where: {
        status: AllocationStatus.ACTIVE,
        expectedReturn: {
          lt: now,
        },
      },
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        allocatedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { expectedReturn: 'asc' },
    });

    return overdue.map(alloc => {
      const daysOverdue = alloc.expectedReturn
        ? Math.floor((now.getTime() - alloc.expectedReturn.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        id: alloc.id,
        asset: alloc.asset,
        allocatedTo: {
          id: alloc.allocatedTo.id,
          name: alloc.allocatedTo.name,
          email: alloc.allocatedTo.email,
          department: alloc.allocatedTo.department?.name || null,
        },
        expectedReturn: alloc.expectedReturn,
        daysOverdue,
      };
    });
  }

  async getUpcomingReturnsList() {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcoming = await prisma.assetAllocation.findMany({
      where: {
        status: AllocationStatus.ACTIVE,
        expectedReturn: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      include: {
        asset: { select: { id: true, assetTag: true, name: true } },
        allocatedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { expectedReturn: 'asc' },
    });

    return upcoming.map(alloc => ({
      id: alloc.id,
      asset: alloc.asset,
      allocatedTo: {
        id: alloc.allocatedTo.id,
        name: alloc.allocatedTo.name,
        email: alloc.allocatedTo.email,
        department: alloc.allocatedTo.department?.name || null,
      },
      expectedReturn: alloc.expectedReturn,
    }));
  }

  async getRecentActivity(userId: string, userRole: string, limit = 10) {
    let whereClause: any = {};

    if (userRole === 'DEPARTMENT_HEAD') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { departmentId: true },
      });
      if (user?.departmentId) {
        whereClause.user = { departmentId: user.departmentId };
      }
    } else if (userRole === 'EMPLOYEE') {
      whereClause.userId = userId;
    }

    return prisma.activityLog.findMany({
      where: whereClause,
      take: limit,
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default DashboardService;
