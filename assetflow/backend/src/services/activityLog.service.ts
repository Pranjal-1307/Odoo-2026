import prisma from '../config/database';

export class ActivityLogService {
  async getActivityLogs(params: {
    page?: number;
    limit?: number;
    userId?: string;
    entity?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.userId) {
      where.userId = params.userId;
    }
    if (params.entity) {
      where.entity = params.entity;
    }
    if (params.action) {
      where.action = params.action;
    }
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) {
        where.createdAt.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        where.createdAt.lte = new Date(params.endDate);
      }
    }

    const data = await prisma.activityLog.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.activityLog.count({ where });

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

  async getActivityByEntity(entity: string, entityId: string) {
    return prisma.activityLog.findMany({
      where: {
        entity,
        entityId,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyActivity(userId: string, params: { page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where = { userId };

    const data = await prisma.activityLog.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.activityLog.count({ where });

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

  async logActivity(data: {
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    details?: any;
    ipAddress?: string;
  }) {
    return prisma.activityLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        details: data.details || null,
        ipAddress: data.ipAddress || null,
      },
    });
  }
}

export default ActivityLogService;
