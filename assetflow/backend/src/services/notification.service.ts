import prisma from '../config/database';
import { AppError } from '../utils/AppError';

export class NotificationService {
  async getNotifications(userId: string, params: { page?: number; limit?: number; isRead?: boolean | string }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (params.isRead !== undefined && params.isRead !== '') {
      where.isRead = params.isRead === 'true' || params.isRead === true;
    }

    const data = await prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.notification.count({ where });

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

  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw AppError.notFound('Notification not found');
    }

    if (notification.userId !== userId) {
      throw AppError.forbidden('You can only mark your own notifications as read');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    refId?: string | null;
    refType?: string | null;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        refId: data.refId || null,
        refType: data.refType || null,
        isRead: false,
      },
    });
  }

  async createBulkNotifications(notifications: {
    userId: string;
    title: string;
    message: string;
    type: string;
    refId?: string | null;
    refType?: string | null;
  }[]) {
    return prisma.notification.createMany({
      data: notifications,
    });
  }

  async deleteOldNotifications(daysOld: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
  }
}

export default NotificationService;
