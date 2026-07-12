import prisma from '../config/database';
import { AssetStatus, MaintenanceStatus, BookingStatus, AllocationStatus, AssetCondition } from '@prisma/client';

export class ReportsService {
  async getAssetUtilizationReport(params: { startDate: Date; endDate: Date; categoryId?: string; departmentId?: string }) {
    const { startDate, endDate, categoryId, departmentId } = params;

    // Filter assets
    const assetWhere: any = {};
    if (categoryId) assetWhere.categoryId = categoryId;
    if (departmentId) assetWhere.departmentId = departmentId;

    const assets = await prisma.asset.findMany({
      where: assetWhere,
      select: { id: true, name: true, assetTag: true },
    });

    const totalAssets = assets.length;
    if (totalAssets === 0) {
      return {
        totalAssets: 0,
        utilized: 0,
        idle: 0,
        utilizationRate: 0,
        mostUsed: [],
        leastUsed: [],
      };
    }

    // Get allocations in period
    const allocations = await prisma.assetAllocation.findMany({
      where: {
        assetId: { in: assets.map(a => a.id) },
        OR: [
          {
            allocationDate: { lte: endDate },
            expectedReturn: { gte: startDate },
          },
          {
            allocationDate: { lte: endDate },
            expectedReturn: null,
          },
        ],
      },
    });

    const utilizedAssetIds = Array.from(new Set(allocations.map(a => a.assetId)));
    const utilized = utilizedAssetIds.length;
    const idle = totalAssets - utilized;
    const utilizationRate = Math.round((utilized / totalAssets) * 100);

    // Calculate usage frequencies
    const freqMap: Record<string, number> = {};
    assets.forEach(a => { freqMap[a.id] = 0; });
    allocations.forEach(a => {
      if (freqMap[a.assetId] !== undefined) {
        freqMap[a.assetId]++;
      }
    });

    const sortedUsage = assets
      .map(a => ({
        asset: a,
        allocationCount: freqMap[a.id],
      }))
      .sort((x, y) => x.allocationCount - y.allocationCount);

    const leastUsed = sortedUsage.slice(0, 10);
    const mostUsed = [...sortedUsage].reverse().slice(0, 10);

    return {
      totalAssets,
      utilized,
      idle,
      utilizationRate,
      mostUsed,
      leastUsed,
    };
  }

  async getMaintenanceReport(params: { startDate: Date; endDate: Date; categoryId?: string }) {
    const { startDate, endDate, categoryId } = params;

    const whereClause: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (categoryId) {
      whereClause.asset = { categoryId };
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: whereClause,
      include: {
        asset: { select: { id: true, assetTag: true, name: true, category: { select: { name: true } } } },
      },
    });

    const totalRequests = requests.length;
    const resolved = requests.filter(r => r.status === MaintenanceStatus.RESOLVED).length;
    const pending = requests.filter(r => r.status === MaintenanceStatus.PENDING).length;

    // Avg resolution days
    const resolvedRequests = requests.filter(r => r.status === MaintenanceStatus.RESOLVED && r.resolvedAt);
    let avgResolutionDays = 0;
    if (resolvedRequests.length > 0) {
      const totalDays = resolvedRequests.reduce((sum, r) => {
        const diff = r.resolvedAt!.getTime() - r.createdAt.getTime();
        return sum + diff / (1000 * 60 * 60 * 24);
      }, 0);
      avgResolutionDays = Math.round((totalDays / resolvedRequests.length) * 10) / 10;
    }

    // Group by Priority
    const priorityCounts: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    requests.forEach(r => { priorityCounts[r.priority] = (priorityCounts[r.priority] || 0) + 1; });
    const byPriority = Object.keys(priorityCounts).map(priority => ({
      priority,
      count: priorityCounts[priority],
    }));

    // Group by Category
    const categoryCounts: Record<string, number> = {};
    requests.forEach(r => {
      const catName = r.asset.category.name;
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    });
    const byCategory = Object.keys(categoryCounts).map(category => ({
      category,
      count: categoryCounts[category],
    }));

    // Frequent assets (most repairs)
    const assetFreq: Record<string, { count: number; asset: any }> = {};
    requests.forEach(r => {
      if (!assetFreq[r.assetId]) {
        assetFreq[r.assetId] = { count: 0, asset: r.asset };
      }
      assetFreq[r.assetId].count++;
    });
    const frequentAssets = Object.values(assetFreq)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(item => ({
        asset: item.asset,
        requestCount: item.count,
      }));

    // Monthly Trend (simplistic grouping for current set of requests)
    const trendMap: Record<string, number> = {};
    requests.forEach(r => {
      const monthYear = r.createdAt.toLocaleString('default', { month: 'short', year: '2-digit' });
      trendMap[monthYear] = (trendMap[monthYear] || 0) + 1;
    });
    const monthlyTrend = Object.keys(trendMap).map(month => ({
      month,
      count: trendMap[month],
    }));

    return {
      totalRequests,
      resolved,
      pending,
      avgResolutionDays,
      byPriority,
      byCategory,
      frequentAssets,
      monthlyTrend,
    };
  }

  async getDepartmentAllocationReport() {
    const departments = await prisma.department.findMany({
      include: {
        assets: {
          select: {
            status: true,
            acquisitionCost: true,
            allocations: {
              where: { status: AllocationStatus.ACTIVE },
            },
          },
        },
      },
    });

    const now = new Date();

    const report = departments.map(dept => {
      const totalAssets = dept.assets.length;
      const allocatedAssets = dept.assets.filter(a => a.status === AssetStatus.ALLOCATED).length;
      const availableAssets = dept.assets.filter(a => a.status === AssetStatus.AVAILABLE).length;

      let overdueReturns = 0;
      dept.assets.forEach(a => {
        const activeAlloc = a.allocations[0];
        if (activeAlloc && activeAlloc.expectedReturn && activeAlloc.expectedReturn < now) {
          overdueReturns++;
        }
      });

      const totalValue = dept.assets.reduce((sum, a) => sum + Number(a.acquisitionCost || 0), 0);

      return {
        name: dept.name,
        totalAssets,
        allocatedAssets,
        availableAssets,
        overdueReturns,
        totalValue,
      };
    });

    return { departments: report };
  }

  async getBookingHeatmap(params: { assetId?: string; startDate: Date; endDate: Date }) {
    const { assetId, startDate, endDate } = params;

    const whereClause: any = {
      startTime: { gte: startDate, lte: endDate },
      status: { notIn: [BookingStatus.CANCELLED] },
    };
    if (assetId) {
      whereClause.assetId = assetId;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
    });

    const totalBookings = bookings.length;

    // Day: 0 (Sun) to 6 (Sat)
    // Hour: 0 to 23
    const map: Record<string, number> = {};
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        map[`${day}-${hour}`] = 0;
      }
    }

    bookings.forEach(b => {
      const day = b.startTime.getUTCDay();
      const hour = b.startTime.getUTCHours();
      map[`${day}-${hour}`]++;
    });

    const heatmap = Object.keys(map).map(key => {
      const [day, hour] = key.split('-').map(Number);
      return {
        dayOfWeek: day,
        hour,
        bookingCount: map[key],
      };
    });

    // Peak hours
    const daysName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const formatHour = (h: number) => {
      const suffix = h >= 12 ? 'PM' : 'AM';
      const formatted = h % 12 === 0 ? 12 : h % 12;
      return `${formatted}:00 ${suffix}`;
    };

    const peakHours = heatmap
      .filter(item => item.bookingCount > 0)
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 5)
      .map(item => ({
        dayOfWeek: daysName[item.dayOfWeek],
        hour: formatHour(item.hour),
        count: item.bookingCount,
      }));

    return {
      heatmap,
      peakHours,
      totalBookings,
    };
  }

  async getAssetLifecycleReport() {
    const totalAssets = await prisma.asset.count();

    // Group by status
    const statusRaw = await prisma.asset.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    const byStatus = statusRaw.map(item => ({
      status: item.status,
      count: item._count.status,
      percentage: totalAssets > 0 ? Math.round((item._count.status / totalAssets) * 100) : 0,
    }));

    // Group by condition
    const conditionRaw = await prisma.asset.groupBy({
      by: ['condition'],
      _count: { condition: true },
    });
    const byCondition = conditionRaw.map(item => ({
      condition: item.condition,
      count: item._count.condition,
    }));

    // Nearing retirement (over 5 years old or condition DAMAGED/POOR)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

    const nearingRetirement = await prisma.asset.findMany({
      where: {
        OR: [
          { acquisitionDate: { lt: fiveYearsAgo } },
          { condition: { in: [AssetCondition.DAMAGED, AssetCondition.POOR] } },
        ],
        status: { notIn: [AssetStatus.RETIRED, AssetStatus.DISPOSED] },
      },
      include: { category: true },
      take: 10,
    });

    // Due for maintenance (Poor condition, or has pending maintenance requests)
    const dueForMaintenance = await prisma.asset.findMany({
      where: {
        OR: [
          { condition: AssetCondition.POOR },
          { maintenanceRequests: { some: { status: MaintenanceStatus.PENDING } } },
        ],
        status: { notIn: [AssetStatus.RETIRED, AssetStatus.DISPOSED, AssetStatus.UNDER_MAINTENANCE] },
      },
      include: { category: true },
      take: 10,
    });

    // Recently disposed (status DISPOSED, resolved in last 30 days)
    const recentlyDisposed = await prisma.asset.findMany({
      where: {
        status: AssetStatus.DISPOSED,
      },
      include: { category: true },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    return {
      byStatus,
      byCondition,
      nearingRetirement,
      dueForMaintenance,
      recentlyDisposed,
    };
  }
}

export default ReportsService;
