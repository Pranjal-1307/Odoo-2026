import prisma from '../config/database';
import { AllocationStatus, TransferStatus, AssetCondition } from '@prisma/client';

export class AllocationRepository {
  async findActiveByAsset(assetId: string) {
    return prisma.assetAllocation.findFirst({
      where: {
        assetId,
        status: AllocationStatus.ACTIVE,
      },
      include: {
        allocatedTo: {
          select: {
            id: true,
            name: true,
            employeeCode: true,
            email: true,
            department: {
              select: {
                id: true,
                headId: true,
              },
            },
          },
        },
        allocatedBy: { select: { id: true, name: true } },
      },
    });
  }

  async findAllByAsset(assetId: string) {
    return prisma.assetAllocation.findMany({
      where: { assetId },
      include: {
        allocatedTo: { select: { id: true, name: true, employeeCode: true, email: true } },
        allocatedBy: { select: { id: true, name: true } },
      },
      orderBy: { allocationDate: 'desc' },
    });
  }

  async findAllByUser(userId: string) {
    return prisma.assetAllocation.findMany({
      where: {
        allocatedToId: userId,
        status: AllocationStatus.ACTIVE,
      },
      include: {
        asset: { include: { category: true } },
      },
    });
  }

  async findOverdue() {
    const now = new Date();
    return prisma.assetAllocation.findMany({
      where: {
        status: AllocationStatus.ACTIVE,
        expectedReturn: {
          lt: now,
        },
      },
      include: {
        asset: true,
        allocatedTo: { select: { id: true, name: true, employeeCode: true, email: true, department: true } },
      },
    });
  }

  async create(data: {
    assetId: string;
    allocatedToId: string;
    allocatedById: string;
    expectedReturn?: Date | null;
    notes?: string;
  }) {
    return prisma.assetAllocation.create({
      data: {
        assetId: data.assetId,
        allocatedToId: data.allocatedToId,
        allocatedById: data.allocatedById,
        expectedReturn: data.expectedReturn || null,
        returnNotes: data.notes || null,
        status: AllocationStatus.ACTIVE,
      },
      include: {
        asset: true,
        allocatedTo: { select: { id: true, name: true, employeeCode: true } },
        allocatedBy: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.assetAllocation.update({
      where: { id },
      data,
    });
  }

  async markReturned(id: string, condition: AssetCondition, notes?: string) {
    return prisma.assetAllocation.update({
      where: { id },
      data: {
        status: AllocationStatus.RETURNED,
        returnedDate: new Date(),
        returnCondition: condition,
        returnNotes: notes || null,
      },
      include: {
        asset: true,
        allocatedTo: { select: { id: true, name: true } },
      },
    });
  }

  async findTransferById(id: string) {
    return prisma.transferRequest.findUnique({
      where: { id },
      include: {
        asset: true,
        fromUser: { select: { id: true, name: true, employeeCode: true, email: true } },
        toUser: { select: { id: true, name: true, employeeCode: true, email: true } },
      },
    });
  }

  async findPendingTransfers() {
    return prisma.transferRequest.findMany({
      where: {
        status: TransferStatus.PENDING,
      },
      include: {
        asset: true,
        fromUser: { select: { id: true, name: true, employeeCode: true } },
        toUser: { select: { id: true, name: true, employeeCode: true } },
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async findTransfersByAsset(assetId: string) {
    return prisma.transferRequest.findMany({
      where: { assetId },
      include: {
        fromUser: { select: { id: true, name: true } },
        toUser: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async createTransfer(data: {
    assetId: string;
    fromUserId: string;
    toUserId: string;
    reason: string;
  }) {
    return prisma.transferRequest.create({
      data: {
        assetId: data.assetId,
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
        reason: data.reason,
        status: TransferStatus.PENDING,
      },
      include: {
        asset: true,
        fromUser: { select: { id: true, name: true } },
        toUser: { select: { id: true, name: true } },
      },
    });
  }

  async updateTransfer(id: string, data: any) {
    return prisma.transferRequest.update({
      where: { id },
      data,
      include: {
        asset: true,
        fromUser: { select: { id: true, name: true } },
        toUser: { select: { id: true, name: true } },
      },
    });
  }

  async getOverdueCount() {
    const now = new Date();
    return prisma.assetAllocation.count({
      where: {
        status: AllocationStatus.ACTIVE,
        expectedReturn: {
          lt: now,
        },
      },
    });
  }

  async getPendingTransferCount() {
    return prisma.transferRequest.count({
      where: {
        status: TransferStatus.PENDING,
      },
    });
  }

  async getActiveAllocationCount() {
    return prisma.assetAllocation.count({
      where: {
        status: AllocationStatus.ACTIVE,
      },
    });
  }
}
export default AllocationRepository;
