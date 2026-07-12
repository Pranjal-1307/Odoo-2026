import { MaintenanceStatus, MaintenancePriority, AssetStatus, UserStatus } from '@prisma/client';
import MaintenanceRepository from '../repositories/maintenance.repository';
import prisma from '../config/database';
import { AppError } from '../utils/AppError';
import { logActivity } from '../middlewares/activityLogger';
import { PaginationParams } from '../types';

const repository = new MaintenanceRepository();

export class MaintenanceService {
  async raiseRequest(data: {
    assetId: string;
    issue: string;
    priority?: MaintenancePriority;
    photoUrl?: string | null;
  }, userId: string) {
    const asset = await prisma.asset.findUnique({
      where: { id: data.assetId },
    });
    if (!asset) {
      throw AppError.notFound('Asset not found');
    }

    // Check existing request
    const existing = await prisma.maintenanceRequest.findFirst({
      where: {
        assetId: data.assetId,
        status: { in: [MaintenanceStatus.PENDING, MaintenanceStatus.APPROVED, MaintenanceStatus.ASSIGNED, MaintenanceStatus.IN_PROGRESS] },
      },
    });

    if (existing) {
      console.warn(`[Maintenance Warning] Asset ${asset.assetTag} already has an active maintenance request (ID: ${existing.id})`);
    }

    const request = await repository.create({
      assetId: data.assetId,
      raisedById: userId,
      issue: data.issue,
      priority: data.priority,
      photoUrl: data.photoUrl,
    });

    // Notify Asset Managers
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
          title: 'New Maintenance Request',
          message: `New maintenance request for ${asset.assetTag}: ${data.issue.substring(0, 30)}...`,
          type: 'MAINTENANCE_RAISED',
          refId: request.id,
          refType: 'MAINTENANCE',
        },
      });
    }

    await logActivity({
      userId,
      action: 'RAISE_MAINTENANCE',
      entity: 'MaintenanceRequest',
      entityId: request.id,
      details: { assetTag: asset.assetTag, issue: data.issue },
    });

    return request;
  }

  async approveOrReject(requestId: string, status: 'APPROVED' | 'REJECTED', approvedById: string) {
    const request = await repository.findById(requestId);
    if (!request) {
      throw AppError.notFound('Maintenance request not found');
    }

    if (request.status !== MaintenanceStatus.PENDING) {
      throw AppError.badRequest('Request is already resolved or in progress');
    }

    const updated = await repository.update(requestId, {
      status,
      approvedById,
    });

    // Update asset status if approved
    if (status === 'APPROVED') {
      await prisma.asset.update({
        where: { id: request.assetId },
        data: { status: AssetStatus.UNDER_MAINTENANCE },
      });
    }

    // Notify requester
    await prisma.notification.create({
      data: {
        userId: request.raisedById,
        title: status === 'APPROVED' ? 'Maintenance Approved' : 'Maintenance Rejected',
        message: status === 'APPROVED' 
          ? `Your maintenance request for ${request.asset.assetTag} has been approved`
          : `Your maintenance request for ${request.asset.assetTag} was rejected`,
        type: status === 'APPROVED' ? 'MAINTENANCE_APPROVED' : 'MAINTENANCE_REJECTED',
        refId: requestId,
        refType: 'MAINTENANCE',
      },
    });

    // Log Activity
    await logActivity({
      userId: approvedById,
      action: status === 'APPROVED' ? 'APPROVE_MAINTENANCE' : 'REJECT_MAINTENANCE',
      entity: 'MaintenanceRequest',
      entityId: requestId,
      details: { assetTag: request.asset.assetTag },
    });

    return updated;
  }

  async assignTechnician(requestId: string, technicianId: string, userId: string) {
    const request = await repository.findById(requestId);
    if (!request) {
      throw AppError.notFound('Maintenance request not found');
    }

    if (request.status !== MaintenanceStatus.APPROVED) {
      throw AppError.badRequest('Request must be approved before assigning a technician');
    }

    const technician = await prisma.user.findUnique({
      where: { id: technicianId },
    });
    if (!technician) {
      throw AppError.badRequest('Technician user not found');
    }

    const updated = await repository.update(requestId, {
      technicianId,
      status: MaintenanceStatus.ASSIGNED,
    });

    // Notify technician
    await prisma.notification.create({
      data: {
        userId: technicianId,
        title: 'Maintenance Assigned',
        message: `You have been assigned to maintenance for ${request.asset.assetTag}`,
        type: 'AUDIT_ASSIGNED', // Reusing matching type or generic notification
        refId: requestId,
        refType: 'MAINTENANCE',
      },
    });

    await logActivity({
      userId,
      action: 'UPDATE',
      entity: 'MaintenanceRequest',
      entityId: requestId,
      details: { assetTag: request.asset.assetTag, assignedTo: technician.name },
    });

    return updated;
  }

  async startWork(requestId: string, userId: string) {
    const request = await repository.findById(requestId);
    if (!request) {
      throw AppError.notFound('Maintenance request not found');
    }

    if (request.status !== MaintenanceStatus.ASSIGNED) {
      throw AppError.badRequest('Request must be assigned before starting work');
    }

    if (request.technicianId !== userId) {
      throw AppError.forbidden('Only the assigned technician can start this work');
    }

    const updated = await repository.update(requestId, {
      status: MaintenanceStatus.IN_PROGRESS,
    });

    await logActivity({
      userId,
      action: 'UPDATE',
      entity: 'MaintenanceRequest',
      entityId: requestId,
      details: { assetTag: request.asset.assetTag, status: 'IN_PROGRESS' },
    });

    return updated;
  }

  async resolveRequest(requestId: string, resolutionNotes: string, userId: string) {
    const request = await repository.findById(requestId);
    if (!request) {
      throw AppError.notFound('Maintenance request not found');
    }

    if (request.status !== MaintenanceStatus.IN_PROGRESS && request.status !== MaintenanceStatus.ASSIGNED) {
      throw AppError.badRequest('Request must be in progress or assigned to be resolved');
    }

    const updated = await repository.update(requestId, {
      status: MaintenanceStatus.RESOLVED,
      resolutionNotes,
      resolvedAt: new Date(),
    });

    // Update asset back to AVAILABLE
    await prisma.asset.update({
      where: { id: request.assetId },
      data: { status: AssetStatus.AVAILABLE },
    });

    // Notify requester
    await prisma.notification.create({
      data: {
        userId: request.raisedById,
        title: 'Maintenance Resolved',
        message: `Maintenance for ${request.asset.assetTag} has been resolved: ${resolutionNotes}`,
        type: 'MAINTENANCE_RESOLVED',
        refId: requestId,
        refType: 'MAINTENANCE',
      },
    });

    // Notify manager
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
          title: 'Maintenance Resolved',
          message: `Maintenance for ${request.asset.assetTag} has been resolved by technician`,
          type: 'MAINTENANCE_RESOLVED',
          refId: requestId,
          refType: 'MAINTENANCE',
        },
      });
    }

    await logActivity({
      userId,
      action: 'RESOLVE_MAINTENANCE',
      entity: 'MaintenanceRequest',
      entityId: requestId,
      details: { assetTag: request.asset.assetTag, notes: resolutionNotes },
    });

    return updated;
  }

  async getAllRequests(params: PaginationParams & { status?: MaintenanceStatus; priority?: MaintenancePriority; assetId?: string }) {
    return repository.findAll(params);
  }

  async getRequestById(id: string) {
    const request = await repository.findById(id);
    if (!request) {
      throw AppError.notFound('Maintenance request not found');
    }
    return request;
  }

  async getMyRequests(userId: string) {
    const list = await prisma.maintenanceRequest.findMany({
      where: { raisedById: userId },
      include: { asset: true },
      orderBy: { createdAt: 'desc' },
    });
    return list;
  }

  async getMaintenanceStats() {
    return repository.getMaintenanceStats();
  }
}

export default MaintenanceService;
