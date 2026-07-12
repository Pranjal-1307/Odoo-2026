import { AllocationStatus, TransferStatus, AssetStatus, AssetCondition, UserStatus } from '@prisma/client';
import AllocationRepository from '../repositories/allocation.repository';
import prisma from '../config/database';
import { AppError } from '../utils/AppError';
import { logActivity } from '../middlewares/activityLogger';
import { PaginationParams } from '../types';

const allocationRepository = new AllocationRepository();

export class AllocationService {
  async allocateAsset(data: {
    assetId: string;
    allocatedToId: string;
    expectedReturn?: Date | null;
    notes?: string;
  }, allocatedById: string) {
    // 1. Validate asset exists
    const asset = await prisma.asset.findUnique({
      where: { id: data.assetId },
    });
    if (!asset) {
      throw AppError.notFound('Asset not found');
    }

    // 2. Check asset status
    if (asset.status === AssetStatus.ALLOCATED) {
      const activeAlloc = await allocationRepository.findActiveByAsset(data.assetId);
      if (activeAlloc) {
        const errorData = {
          currentHolder: {
            id: activeAlloc.allocatedTo.id,
            name: activeAlloc.allocatedTo.name,
            employeeCode: activeAlloc.allocatedTo.employeeCode,
            email: activeAlloc.allocatedTo.email,
          },
          allocationId: activeAlloc.id,
          allocatedSince: activeAlloc.allocationDate,
        };
        const err = AppError.conflict(`Asset ${asset.assetTag} is currently allocated to ${activeAlloc.allocatedTo.name} (${activeAlloc.allocatedTo.employeeCode}). Use Transfer Request instead.`);
        (err as any).data = errorData;
        throw err;
      }
    } else if (asset.status !== AssetStatus.AVAILABLE) {
      throw AppError.badRequest(`Asset is not available for allocation (current status: ${asset.status})`);
    }

    // 3. Validate allocatedTo user
    const toUser = await prisma.user.findUnique({
      where: { id: data.allocatedToId },
    });
    if (!toUser || toUser.status === UserStatus.INACTIVE) {
      throw AppError.badRequest('Target user does not exist or is inactive');
    }

    // 4. Create allocation
    const allocation = await allocationRepository.create({
      assetId: data.assetId,
      allocatedToId: data.allocatedToId,
      allocatedById,
      expectedReturn: data.expectedReturn,
      notes: data.notes,
    });

    // 5. Update asset status
    await prisma.asset.update({
      where: { id: data.assetId },
      data: { status: AssetStatus.ALLOCATED },
    });

    // 6. Create notification
    await prisma.notification.create({
      data: {
        userId: data.allocatedToId,
        title: 'Asset Allocated',
        message: `Asset ${asset.assetTag} (${asset.name}) has been allocated to you`,
        type: 'ASSET_ASSIGNED',
        refId: allocation.id,
        refType: 'ALLOCATION',
      },
    });

    // 7. Log activity
    await logActivity({
      userId: allocatedById,
      action: 'ALLOCATE',
      entity: 'AssetAllocation',
      entityId: allocation.id,
      details: { assetTag: asset.assetTag, allocatedTo: toUser.name },
    });

    return allocation;
  }

  async returnAsset(allocationId: string, returnData: { returnCondition: AssetCondition; returnNotes?: string }, userId: string) {
    // 1. Find allocation
    const allocation = await prisma.assetAllocation.findUnique({
      where: { id: allocationId },
      include: {
        asset: true,
        allocatedTo: true,
      },
    });
    if (!allocation) {
      throw AppError.notFound('Allocation record not found');
    }
    if (allocation.status !== AllocationStatus.ACTIVE) {
      throw AppError.badRequest('Asset has already been returned or transferred');
    }

    // 2. Mark returned
    const updatedAlloc = await allocationRepository.markReturned(allocationId, returnData.returnCondition, returnData.returnNotes);

    // 3. Update asset status
    await prisma.asset.update({
      where: { id: allocation.assetId },
      data: {
        status: AssetStatus.AVAILABLE,
        condition: returnData.returnCondition,
      },
    });

    // 4. Notify Asset Managers (roles ADMIN or ASSET_MANAGER)
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
          title: 'Asset Returned',
          message: `Asset ${allocation.asset.assetTag} has been returned by ${allocation.allocatedTo.name}`,
          type: 'ASSET_RETURNED',
          refId: allocationId,
          refType: 'ALLOCATION',
        },
      });
    }

    // 5. Log activity
    await logActivity({
      userId,
      action: 'RETURN',
      entity: 'AssetAllocation',
      entityId: allocationId,
      details: { assetTag: allocation.asset.assetTag, returnedBy: allocation.allocatedTo.name, condition: returnData.returnCondition },
    });

    return updatedAlloc;
  }

  async requestTransfer(data: { assetId: string; toUserId: string; reason: string }, requestedByUserId: string) {
    // 1. Validate asset exists
    const asset = await prisma.asset.findUnique({
      where: { id: data.assetId },
    });
    if (!asset) {
      throw AppError.notFound('Asset not found');
    }

    // 2. Validate asset is ALLOCATED
    if (asset.status !== AssetStatus.ALLOCATED) {
      throw AppError.badRequest('Asset is not currently allocated. You can allocate it directly.');
    }

    // 3. Find current holder
    const activeAlloc = await allocationRepository.findActiveByAsset(data.assetId);
    if (!activeAlloc) {
      throw AppError.badRequest('No active allocation found for this asset');
    }

    // 4. Validate target user
    const toUser = await prisma.user.findUnique({
      where: { id: data.toUserId },
    });
    if (!toUser || toUser.status === UserStatus.INACTIVE) {
      throw AppError.badRequest('Target user does not exist or is inactive');
    }

    // 5. Check duplicate pending transfer
    const existingPending = await prisma.transferRequest.findFirst({
      where: {
        assetId: data.assetId,
        status: TransferStatus.PENDING,
      },
    });
    if (existingPending) {
      throw AppError.conflict('A pending transfer request already exists for this asset');
    }

    // 6. Create TransferRequest
    const transfer = await allocationRepository.createTransfer({
      assetId: data.assetId,
      fromUserId: activeAlloc.allocatedToId,
      toUserId: data.toUserId,
      reason: data.reason,
    });

    // 7. Notify Asset Managers & Department Head of fromUser's department
    const managers = await prisma.user.findMany({
      where: {
        OR: [
          { role: { in: ['ADMIN', 'ASSET_MANAGER'] } },
          { id: activeAlloc.allocatedTo.department?.headId || undefined },
        ],
        status: UserStatus.ACTIVE,
      },
    });

    for (const manager of managers) {
      await prisma.notification.create({
        data: {
          userId: manager.id,
          title: 'Transfer Request',
          message: `Transfer request for ${asset.assetTag} from ${activeAlloc.allocatedTo.name} to ${toUser.name}`,
          type: 'TRANSFER_REQUESTED',
          refId: transfer.id,
          refType: 'TRANSFER',
        },
      });
    }

    // 8. Log activity
    await logActivity({
      userId: requestedByUserId,
      action: 'TRANSFER_REQUEST',
      entity: 'TransferRequest',
      entityId: transfer.id,
      details: { assetTag: asset.assetTag, from: activeAlloc.allocatedTo.name, to: toUser.name },
    });

    return transfer;
  }

  async resolveTransfer(transferId: string, status: TransferStatus, approvedByUserId: string) {
    // 1. Find transfer
    const transfer = await allocationRepository.findTransferById(transferId);
    if (!transfer) {
      throw AppError.notFound('Transfer request not found');
    }
    if (transfer.status !== TransferStatus.PENDING) {
      throw AppError.badRequest('Transfer request has already been resolved');
    }

    const updatedTransfer = await allocationRepository.updateTransfer(transferId, {
      status,
      approvedById: approvedByUserId,
      resolvedAt: new Date(),
    });

    if (status === TransferStatus.APPROVED) {
      // Find current active allocation and mark as TRANSFERRED
      const activeAlloc = await allocationRepository.findActiveByAsset(transfer.assetId);
      if (activeAlloc) {
        await allocationRepository.update(activeAlloc.id, {
          status: AllocationStatus.TRANSFERRED,
          returnedDate: new Date(),
        });
      }

      // Create new allocation
      await allocationRepository.create({
        assetId: transfer.assetId,
        allocatedToId: transfer.toUserId,
        allocatedById: approvedByUserId,
      });

      // Notify users
      await prisma.notification.create({
        data: {
          userId: transfer.fromUserId,
          title: 'Asset Transferred Out',
          message: `Asset ${transfer.asset.assetTag} has been transferred to ${transfer.toUser.name}`,
          type: 'TRANSFER_APPROVED',
          refId: transferId,
          refType: 'TRANSFER',
        },
      });

      await prisma.notification.create({
        data: {
          userId: transfer.toUserId,
          title: 'Asset Transferred In',
          message: `Asset ${transfer.asset.assetTag} has been transferred to you from ${transfer.fromUser.name}`,
          type: 'TRANSFER_APPROVED',
          refId: transferId,
          refType: 'TRANSFER',
        },
      });
    } else {
      // Notify requester
      await prisma.notification.create({
        data: {
          userId: transfer.fromUserId,
          title: 'Transfer Request Rejected',
          message: `Transfer request for ${transfer.asset.assetTag} to ${transfer.toUser.name} was rejected`,
          type: 'TRANSFER_REJECTED',
          refId: transferId,
          refType: 'TRANSFER',
        },
      });
    }

    // Log activity
    await logActivity({
      userId: approvedByUserId,
      action: status === TransferStatus.APPROVED ? 'TRANSFER_APPROVE' : 'TRANSFER_REJECT',
      entity: 'TransferRequest',
      entityId: transferId,
      details: { assetTag: transfer.asset.assetTag, status },
    });

    return updatedTransfer;
  }

  async getMyAllocations(userId: string) {
    return allocationRepository.findAllByUser(userId);
  }

  async getAllAllocations(params: PaginationParams & { status?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) {
      where.status = params.status as AllocationStatus;
    }

    const data = await prisma.assetAllocation.findMany({
      where,
      skip,
      take: limit,
      include: {
        asset: true,
        allocatedTo: { select: { id: true, name: true, employeeCode: true } },
        allocatedBy: { select: { id: true, name: true } },
      },
      orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'desc' } : { createdAt: 'desc' },
    });

    const total = await prisma.assetAllocation.count({ where });

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

  async getOverdueAllocations() {
    const overdue = await allocationRepository.findOverdue();
    const now = new Date();

    return overdue.map(alloc => {
      const daysOverdue = alloc.expectedReturn
        ? Math.floor((now.getTime() - alloc.expectedReturn.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        id: alloc.id,
        asset: {
          id: alloc.asset.id,
          assetTag: alloc.asset.assetTag,
          name: alloc.asset.name,
        },
        allocatedTo: {
          id: alloc.allocatedTo.id,
          name: alloc.allocatedTo.name,
          employeeCode: alloc.allocatedTo.employeeCode,
          email: alloc.allocatedTo.email,
        },
        expectedReturn: alloc.expectedReturn,
        daysOverdue: Math.max(0, daysOverdue),
      };
    });
  }

  async getPendingTransfers() {
    return allocationRepository.findPendingTransfers();
  }
}

export default AllocationService;
