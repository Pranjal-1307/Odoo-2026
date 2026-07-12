import prisma from '../config/database';
import { AuditCycleStatus, AuditVerification, AuditItem } from '@prisma/client';
import { PaginationParams } from '../types';

export interface CreateAuditItemData {
  auditCycleId: string;
  assetId: string;
  auditorId: string;
  verification: AuditVerification;
}

export class AuditRepository {
  async findAllCycles(params: PaginationParams & { status?: AuditCycleStatus; departmentId?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.departmentId) {
      where.departmentId = params.departmentId;
    }
    if (params.search) {
      where.title = { contains: params.search };
    }

    const data = await prisma.auditCycle.findMany({
      where,
      skip,
      take: limit,
      include: {
        department: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
      orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'desc' } : { createdAt: 'desc' },
    });

    const total = await prisma.auditCycle.count({ where });

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

  async findCycleById(id: string) {
    return prisma.auditCycle.findUnique({
      where: { id },
      include: {
        department: true,
        createdBy: { select: { id: true, name: true } },
        items: {
          include: {
            asset: true,
            auditor: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async createCycle(data: {
    title: string;
    departmentId?: string | null;
    location?: string | null;
    startDate: Date;
    endDate: Date;
    createdById: string;
  }) {
    return prisma.auditCycle.create({
      data: {
        title: data.title,
        departmentId: data.departmentId || null,
        location: data.location || null,
        startDate: data.startDate,
        endDate: data.endDate,
        createdById: data.createdById,
        status: AuditCycleStatus.PLANNED,
      },
    });
  }

  async updateCycle(id: string, data: any) {
    return prisma.auditCycle.update({
      where: { id },
      data,
    });
  }

  async findItemsByCycle(auditCycleId: string) {
    return prisma.auditItem.findMany({
      where: { auditCycleId },
      include: {
        asset: true,
        auditor: { select: { id: true, name: true, employeeCode: true } },
      },
    });
  }

  async findItemById(id: string) {
    return prisma.auditItem.findUnique({
      where: { id },
      include: {
        asset: true,
        auditCycle: true,
      },
    });
  }

  async createItems(items: CreateAuditItemData[]) {
    return prisma.auditItem.createMany({
      data: items,
      skipDuplicates: true,
    });
  }

  async updateItem(id: string, data: any) {
    return prisma.auditItem.update({
      where: { id },
      data,
      include: {
        asset: true,
        auditor: { select: { id: true, name: true } },
      },
    });
  }

  async getDiscrepancyReport(cycleId: string) {
    const cycle = await prisma.auditCycle.findUnique({
      where: { id: cycleId },
    });
    if (!cycle) return null;

    const items = await prisma.auditItem.findMany({
      where: { auditCycleId: cycleId },
      include: {
        asset: true,
        auditor: { select: { id: true, name: true, employeeCode: true } },
      },
    });

    const totalAssets = items.length;
    const verified = items.filter(i => i.verification === AuditVerification.VERIFIED).length;
    const missing = items.filter(i => i.verification === AuditVerification.MISSING).length;
    const damaged = items.filter(i => i.verification === AuditVerification.DAMAGED).length;
    const pending = items.filter(i => i.verification === AuditVerification.PENDING).length;

    const discrepancies = items.filter(
      i => i.verification === AuditVerification.MISSING || i.verification === AuditVerification.DAMAGED
    );

    return {
      cycle: {
        id: cycle.id,
        title: cycle.title,
        status: cycle.status,
      },
      summary: {
        totalAssets,
        verified,
        missing,
        damaged,
        pending,
        completionPercentage: totalAssets > 0 ? Math.round(((totalAssets - pending) / totalAssets) * 100) : 0,
      },
      discrepancies,
    };
  }

  async getAuditStats() {
    const activeCycles = await prisma.auditCycle.count({
      where: { status: AuditCycleStatus.IN_PROGRESS },
    });

    const completedCycles = await prisma.auditCycle.count({
      where: { status: { in: [AuditCycleStatus.COMPLETED, AuditCycleStatus.CLOSED] } },
    });

    const totalDiscrepancies = await prisma.auditItem.count({
      where: {
        verification: { in: [AuditVerification.MISSING, AuditVerification.DAMAGED] },
      },
    });

    return {
      activeCycles,
      completedCycles,
      totalDiscrepancies,
    };
  }
}
export default AuditRepository;
