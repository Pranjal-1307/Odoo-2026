import prisma from '../config/database';

export interface LogActivityParams {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details?: any;
  ipAddress?: string;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        details: params.details || null,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    // Fail silently to prevent interrupting business transactions
    console.error('Failed to log activity:', error);
  }
}
