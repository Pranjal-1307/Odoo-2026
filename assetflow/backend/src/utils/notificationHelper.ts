import prisma from '../config/database';
import { NotificationService } from '../services/notification.service';
import { UserStatus } from '@prisma/client';

const notificationService = new NotificationService();

export async function notifyUser(
  userId: string,
  title: string,
  message: string,
  type: string,
  refId?: string | null,
  refType?: string | null
) {
  return notificationService.createNotification({
    userId,
    title,
    message,
    type,
    refId: refId || null,
    refType: refType || null,
  });
}

export async function notifyAssetManagers(
  title: string,
  message: string,
  type: string,
  refId?: string | null,
  refType?: string | null
) {
  const managers = await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'ASSET_MANAGER'] },
      status: UserStatus.ACTIVE,
    },
  });

  const notifications = managers.map(manager => ({
    userId: manager.id,
    title,
    message,
    type,
    refId: refId || null,
    refType: refType || null,
  }));

  if (notifications.length > 0) {
    return notificationService.createBulkNotifications(notifications);
  }
}

export async function notifyDepartmentHead(
  departmentId: string,
  title: string,
  message: string,
  type: string,
  refId?: string | null,
  refType?: string | null
) {
  const dept = await prisma.department.findUnique({
    where: { id: departmentId },
    select: { headId: true },
  });

  if (dept && dept.headId) {
    return notificationService.createNotification({
      userId: dept.headId,
      title,
      message,
      type,
      refId: refId || null,
      refType: refType || null,
    });
  }
}

export async function notifyAdmins(
  title: string,
  message: string,
  type: string,
  refId?: string | null,
  refType?: string | null
) {
  const admins = await prisma.user.findMany({
    where: {
      role: 'ADMIN',
      status: UserStatus.ACTIVE,
    },
  });

  const notifications = admins.map(admin => ({
    userId: admin.id,
    title,
    message,
    type,
    refId: refId || null,
    refType: refType || null,
  }));

  if (notifications.length > 0) {
    return notificationService.createBulkNotifications(notifications);
  }
}
