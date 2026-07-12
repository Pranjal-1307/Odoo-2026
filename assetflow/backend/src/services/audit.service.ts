import { AuditCycleStatus, AuditVerification, AssetStatus, AssetCondition, UserStatus } from '@prisma/client';
import AuditRepository from '../repositories/audit.repository';
import prisma from '../config/database';
import { AppError } from '../utils/AppError';
import { logActivity } from '../middlewares/activityLogger';
import { PaginationParams } from '../types';

const repository = new AuditRepository();

export class AuditService {
  async createAuditCycle(data: {
    title: string;
    departmentId?: string | null;
    location?: string | null;
    startDate: Date;
    endDate: Date;
  }, userId: string) {
    if (data.departmentId) {
      const dept = await prisma.department.findUnique({
        where: { id: data.departmentId },
      });
      if (!dept) throw AppError.badRequest('Target department does not exist');
    }

    const cycle = await repository.createCycle({
      title: data.title,
      departmentId: data.departmentId,
      location: data.location,
      startDate: data.startDate,
      endDate: data.endDate,
      createdById: userId,
    });

    await logActivity({
      userId,
      action: 'CREATE_AUDIT',
      entity: 'AuditCycle',
      entityId: cycle.id,
      details: { title: cycle.title },
    });

    return cycle;
  }

  async startAuditCycle(cycleId: string, userId: string) {
    const cycle = await repository.findCycleById(cycleId);
    if (!cycle) throw AppError.notFound('Audit cycle not found');

    if (cycle.status !== AuditCycleStatus.PLANNED) {
      throw AppError.badRequest('Audit cycle must be in PLANNED status to start');
    }

    // Determine scope
    if (!cycle.departmentId && !cycle.location) {
      throw AppError.badRequest('Scope filters missing: target department or location must be specified');
    }

    const updated = await repository.updateCycle(cycleId, {
      status: AuditCycleStatus.IN_PROGRESS,
    });

    // Notify assigned auditors
    const uniqueAuditors = Array.from(new Set(cycle.items.map(item => item.auditorId)));
    for (const auditorId of uniqueAuditors) {
      await prisma.notification.create({
        data: {
          userId: auditorId,
          title: 'Audit Started',
          message: `Audit cycle "${cycle.title}" has started. Please verify assigned items.`,
          type: 'AUDIT_ASSIGNED',
          refId: cycleId,
          refType: 'AUDIT',
        },
      });
    }

    await logActivity({
      userId,
      action: 'START_AUDIT',
      entity: 'AuditCycle',
      entityId: cycleId,
      details: { title: cycle.title },
    });

    return updated;
  }

  async assignAuditors(cycleId: string, auditorIds: string[], userId: string) {
    const cycle = await prisma.auditCycle.findUnique({
      where: { id: cycleId },
    });
    if (!cycle) throw AppError.notFound('Audit cycle not found');

    if (cycle.status !== AuditCycleStatus.PLANNED && cycle.status !== AuditCycleStatus.IN_PROGRESS) {
      throw AppError.badRequest('Auditors can only be assigned to planned or active cycles');
    }

    // Get assets in scope
    const whereClause: any = {};
    if (cycle.departmentId) {
      whereClause.departmentId = cycle.departmentId;
    }
    if (cycle.location) {
      whereClause.location = { contains: cycle.location };
    }

    const assets = await prisma.asset.findMany({
      where: whereClause,
    });

    if (assets.length === 0) {
      throw AppError.badRequest('No assets found in the specified scope to audit');
    }

    // Distribute assets evenly across auditors
    const items = assets.map((asset, index) => {
      const auditorId = auditorIds[index % auditorIds.length];
      return {
        auditCycleId: cycleId,
        assetId: asset.id,
        auditorId,
        verification: AuditVerification.PENDING,
      };
    });

    // Clear existing items in case of re-assignment
    await prisma.auditItem.deleteMany({
      where: { auditCycleId: cycleId },
    });

    await repository.createItems(items);

    // Notify auditors
    for (const auditorId of auditorIds) {
      await prisma.notification.create({
        data: {
          userId: auditorId,
          title: 'Audit Assignment',
          message: `You have been assigned to audit assets in cycle: "${cycle.title}"`,
          type: 'AUDIT_ASSIGNED',
          refId: cycleId,
          refType: 'AUDIT',
        },
      });
    }

    await logActivity({
      userId,
      action: 'UPDATE',
      entity: 'AuditCycle',
      entityId: cycleId,
      details: { title: cycle.title, auditorsCount: auditorIds.length },
    });

    return { success: true, message: `Assigned ${assets.length} assets to ${auditorIds.length} auditors.` };
  }

  async verifyItem(itemId: string, verification: AuditVerification, remarks: string | null, auditorId: string) {
    const item = await repository.findItemById(itemId);
    if (!item) throw AppError.notFound('Audit item not found');

    if (item.auditorId !== auditorId) {
      throw AppError.forbidden('You are not the assigned auditor for this asset');
    }

    if (item.auditCycle.status !== AuditCycleStatus.IN_PROGRESS) {
      throw AppError.badRequest('Verification is only allowed for active audit cycles');
    }

    const updatedItem = await repository.updateItem(itemId, {
      verification,
      remarks,
      verifiedAt: new Date(),
    });

    await logActivity({
      userId: auditorId,
      action: 'VERIFY_AUDIT',
      entity: 'AuditItem',
      entityId: itemId,
      details: { assetTag: item.asset.assetTag, verification },
    });

    // If missing or damaged, notify managers
    if (verification === AuditVerification.MISSING || verification === AuditVerification.DAMAGED) {
      const managers = await prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'ASSET_MANAGER'] },
          status: UserStatus.ACTIVE,
        },
      });

      for (const manager of managers) {
        await prisma.notification.create({
          data: {
            userId: manager.id,
            title: 'Audit Discrepancy Found',
            message: `Asset ${item.asset.assetTag} marked as ${verification} in cycle "${item.auditCycle.title}"`,
            type: 'AUDIT_DISCREPANCY',
            refId: item.auditCycleId,
            refType: 'AUDIT',
          },
        });
      }
    }

    return updatedItem;
  }

  async getDiscrepancyReport(cycleId: string) {
    const report = await repository.getDiscrepancyReport(cycleId);
    if (!report) throw AppError.notFound('Audit cycle not found');
    return report;
  }

  async closeAuditCycle(cycleId: string, userId: string) {
    const cycle = await repository.findCycleById(cycleId);
    if (!cycle) throw AppError.notFound('Audit cycle not found');

    if (cycle.status !== AuditCycleStatus.IN_PROGRESS) {
      throw AppError.badRequest('Audit cycle must be in progress to be closed');
    }

    // Check all items resolved (no PENDING verification)
    const pendingItemsCount = cycle.items.filter(i => i.verification === AuditVerification.PENDING).length;
    if (pendingItemsCount > 0) {
      throw AppError.badRequest(`Cannot close cycle: ${pendingItemsCount} items are still pending verification`);
    }

    // Process discrepancies
    const discrepancies = cycle.items.filter(
      i => i.verification === AuditVerification.MISSING || i.verification === AuditVerification.DAMAGED
    );

    const processedUpdates = [];

    for (const item of discrepancies) {
      if (item.verification === AuditVerification.MISSING) {
        await prisma.asset.update({
          where: { id: item.assetId },
          data: { status: AssetStatus.LOST },
        });
        processedUpdates.push({ assetTag: item.asset.assetTag, statusUpdated: 'LOST' });
      } else if (item.verification === AuditVerification.DAMAGED) {
        await prisma.asset.update({
          where: { id: item.assetId },
          data: { condition: AssetCondition.DAMAGED },
        });
        processedUpdates.push({ assetTag: item.asset.assetTag, conditionUpdated: 'DAMAGED' });
      }
    }

    // Close the cycle
    const closedCycle = await repository.updateCycle(cycleId, {
      status: AuditCycleStatus.CLOSED,
      closedAt: new Date(),
    });

    // Notify managers
    const managers = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'ASSET_MANAGER'] },
        status: UserStatus.ACTIVE,
      },
    });

    for (const manager of managers) {
      await prisma.notification.create({
        data: {
          userId: manager.id,
          title: 'Audit Cycle Closed',
          message: `Audit cycle "${cycle.title}" has been closed. ${discrepancies.length} discrepancies processed.`,
          type: 'AUDIT_DISCREPANCY',
          refId: cycleId,
          refType: 'AUDIT',
        },
      });
    }

    await logActivity({
      userId,
      action: 'CLOSE_AUDIT',
      entity: 'AuditCycle',
      entityId: cycleId,
      details: { title: cycle.title, discrepanciesProcessed: discrepancies.length },
    });

    return {
      cycle: closedCycle,
      processedUpdates,
    };
  }

  async getAllCycles(params: PaginationParams & { status?: AuditCycleStatus; departmentId?: string }) {
    return repository.findAllCycles(params);
  }

  async getCycleById(id: string) {
    const cycle = await repository.findCycleById(id);
    if (!cycle) throw AppError.notFound('Audit cycle not found');
    return cycle;
  }

  async getMyAuditItems(userId: string) {
    return prisma.auditItem.findMany({
      where: {
        auditorId: userId,
        auditCycle: {
          status: AuditCycleStatus.IN_PROGRESS,
        },
      },
      include: {
        asset: true,
        auditCycle: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default AuditService;
