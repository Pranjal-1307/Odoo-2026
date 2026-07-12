import { UserRole } from '@prisma/client';
import prisma from '../config/database';
import { PaginationParams } from '../types';

export class UserRepository {
  async findAll(params: PaginationParams & { departmentId?: string; role?: string; status?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
        { employeeCode: { contains: params.search } },
      ];
    }
    if (params.departmentId) {
      where.departmentId = params.departmentId;
    }
    if (params.role) {
      where.role = params.role as UserRole;
    }
    if (params.status) {
      where.status = params.status as any;
    }

    const data = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        employeeCode: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        department: { select: { id: true, name: true } },
      },
      orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { createdAt: 'desc' },
    });

    const total = await prisma.user.count({ where });

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

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        employeeCode: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        department: true,
        _count: {
          select: {
            allocationsReceived: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        employeeCode: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        avatarUrl: true,
      },
    });
  }

  async updateRole(id: string, role: UserRole) {
    return prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });
  }
}

export default UserRepository;
