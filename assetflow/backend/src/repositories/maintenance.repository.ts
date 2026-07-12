import prisma from '../config/database';
import { MaintenanceStatus, MaintenancePriority } from '@prisma/client';
import { PaginationParams } from '../types';

export class MaintenanceRepository {
  async findAll(params: PaginationParams & { status?: MaintenanceStatus; priority?: MaintenancePriority; assetId?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.priority) {
      where.priority = params.priority;
    }
    if (params.assetId) {
      where.assetId = params.assetId;
    }
    if (params.search) {
      where.OR = [
        { issue: { contains: params.search } },
        { asset: { name: { contains: params.search } } },
        { asset: { assetTag: { contains: params.search } } },
      ];
    }

    const data = await prisma.maintenanceRequest.findMany({
      where,
      skip,
      take: limit,
      include: {
        asset: true,
        raisedBy: { select: { id: true, name: true, employeeCode: true } },
        approvedBy: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } },
      },
      orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'desc' } : { createdAt: 'desc' },
    });

    const total = await prisma.maintenanceRequest.count({ where });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        asset: true,
        raisedBy: { select: { id: true, name: true, employeeCode: true } },
        approvedBy: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } },
      },
    });
  }

  async findByAsset(assetId: string) {
    return prisma.maintenanceRequest.findMany({
      where: { assetId },
      include: {
        raisedBy: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPending() {
    return prisma.maintenanceRequest.findMany({
      where: { status: MaintenanceStatus.PENDING },
      include: {
        asset: true,
        raisedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    assetId: string;
    raisedById: string;
    issue: string;
    priority?: MaintenancePriority;
    photoUrl?: string | null;
  }) {
    return prisma.maintenanceRequest.create({
      data: {
        assetId: data.assetId,
        raisedById: data.raisedById,
        issue: data.issue,
        priority: data.priority || MaintenancePriority.MEDIUM,
        photoUrl: data.photoUrl || null,
        status: MaintenanceStatus.PENDING,
      },
      include: {
        asset: true,
        raisedBy: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.maintenanceRequest.update({
      where: { id },
      data,
      include: {
        asset: true,
        raisedBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } },
      },
    });
  }

  async getMaintenanceStats() {
    const pending = await prisma.maintenanceRequest.count({
      where: { status: MaintenanceStatus.PENDING },
    });

    const inProgress = await prisma.maintenanceRequest.count({
      where: { status: { in: [MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.ASSIGNED] } },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const resolvedThisMonth = await prisma.maintenanceRequest.count({
      where: {
        status: MaintenanceStatus.RESOLVED,
        resolvedAt: { gte: startOfMonth },
      },
    });

    const byPriorityRaw = await prisma.maintenanceRequest.groupBy({
      by: ['priority'],
      _count: { priority: true },
    });

    const byPriority = byPriorityRaw.map(item => ({
      priority: item.priority,
      count: item._count.priority,
    }));

    return {
      pending,
      inProgress,
      resolvedThisMonth,
      byPriority,
    };
  }
}
export default MaintenanceRepository;
