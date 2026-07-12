import prisma from '../config/database';
import { AssetStatus, AssetCondition } from '@prisma/client';

export interface AssetSearchParams {
  search?: string;
  categoryId?: string;
  departmentId?: string;
  status?: string;
  location?: string;
  bookable?: string | boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class AssetRepository {
  private buildWhereClause(params: AssetSearchParams) {
    const where: any = {};
    
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { assetTag: { contains: params.search } },
        { serialNumber: { contains: params.search } },
      ];
    }
    
    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }
    
    if (params.departmentId) {
      where.departmentId = params.departmentId;
    }
    
    if (params.status) {
      where.status = params.status as AssetStatus;
    }
    
    if (params.location) {
      where.location = { contains: params.location };
    }
    
    if (params.bookable !== undefined && params.bookable !== '') {
      where.bookable = params.bookable === 'true' || params.bookable === true;
    }

    return where;
  }

  async findAll(params: AssetSearchParams) {
    return this.search(params);
  }

  async findById(id: string) {
    return prisma.asset.findUnique({
      where: { id },
      include: {
        category: true,
        department: true,
        createdBy: { select: { id: true, name: true } },
        allocations: {
          where: { status: 'ACTIVE' },
          include: {
            allocatedTo: { select: { id: true, name: true, employeeCode: true, email: true } },
          },
          take: 1,
        },
      },
    });
  }

  async findByAssetTag(tag: string) {
    return prisma.asset.findUnique({
      where: { assetTag: tag },
      include: {
        category: true,
        department: true,
        createdBy: { select: { id: true, name: true } },
        allocations: {
          where: { status: 'ACTIVE' },
          include: {
            allocatedTo: { select: { id: true, name: true, employeeCode: true, email: true } },
          },
          take: 1,
        },
      },
    });
  }

  async create(data: {
    assetTag: string;
    name: string;
    serialNumber?: string | null;
    categoryId: string;
    departmentId?: string | null;
    status: AssetStatus;
    condition: AssetCondition;
    location?: string;
    description?: string;
    acquisitionDate?: Date | null;
    acquisitionCost?: number | null;
    bookable?: boolean;
    photoUrl?: string | null;
    qrCode?: string;
    createdById: string;
  }) {
    return prisma.asset.create({
      data: {
        assetTag: data.assetTag,
        name: data.name,
        serialNumber: data.serialNumber || null,
        categoryId: data.categoryId,
        departmentId: data.departmentId || null,
        status: data.status,
        condition: data.condition,
        location: data.location || null,
        description: data.description || null,
        acquisitionDate: data.acquisitionDate || null,
        acquisitionCost: data.acquisitionCost || null,
        bookable: data.bookable ?? false,
        photoUrl: data.photoUrl || null,
        qrCode: data.qrCode || null,
        createdById: data.createdById,
      },
      include: {
        category: true,
        department: true,
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.asset.update({
      where: { id },
      data,
      include: {
        category: true,
        department: true,
        createdBy: { select: { id: true, name: true } },
      },
    });
  }

  async search(params: AssetSearchParams) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const where = this.buildWhereClause(params);

    const data = await prisma.asset.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: true,
        department: true,
      },
      orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'desc' } : { createdAt: 'desc' },
    });

    const total = await prisma.asset.count({ where });

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

  async getAssetHistory(assetId: string) {
    const allocations = await prisma.assetAllocation.findMany({
      where: { assetId },
      include: {
        allocatedTo: { select: { id: true, name: true, employeeCode: true } },
        allocatedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const maintenance = await prisma.maintenanceRequest.findMany({
      where: { assetId },
      include: {
        raisedBy: { select: { id: true, name: true } },
        technician: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const audits = await prisma.auditItem.findMany({
      where: { assetId },
      include: {
        auditCycle: { select: { id: true, title: true } },
        auditor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const bookings = await prisma.booking.findMany({
      where: { assetId },
      include: {
        bookedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      allocations,
      maintenance,
      audits,
      bookings,
    };
  }

  async getAssetStats() {
    const total = await prisma.asset.count();
    
    const byStatusRaw = await prisma.asset.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const byStatus = byStatusRaw.map(item => ({
      status: item.status,
      count: item._count.status,
    }));

    // Join categories
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { assets: true } },
      },
    });

    const byCategory = categories.map(cat => ({
      category: cat.name,
      count: cat._count.assets,
    }));

    // Join departments
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { assets: true } },
      },
    });

    const byDepartment = departments.map(dept => ({
      department: dept.name,
      count: dept._count.assets,
    }));

    return {
      total,
      byStatus,
      byCategory,
      byDepartment,
    };
  }

  async getLastAssetTag(): Promise<string | null> {
    const lastAsset = await prisma.asset.findFirst({
      orderBy: { assetTag: 'desc' },
      select: { assetTag: true },
    });
    return lastAsset ? lastAsset.assetTag : null;
  }
}

export default AssetRepository;
