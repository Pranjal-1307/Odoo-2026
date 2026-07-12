import prisma from '../config/database';
import { PaginationParams } from '../types';

export class DepartmentRepository {
  async findAll(params: PaginationParams & { status?: any }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.search) {
      where.name = { contains: params.search };
    }
    if (params.status) {
      where.status = params.status;
    }

    const data = await prisma.department.findMany({
      where,
      skip,
      take: limit,
      include: {
        parent: { select: { id: true, name: true } },
        head: { select: { id: true, name: true, email: true } },
        _count: { select: { employees: true } },
      },
      orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { createdAt: 'desc' },
    });

    const total = await prisma.department.count({ where });

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
    return prisma.department.findUnique({
      where: { id },
      include: {
        parent: true,
        head: { select: { id: true, name: true, email: true } },
        children: true,
        employees: {
          select: {
            id: true,
            employeeCode: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });
  }

  async create(data: any) {
    return prisma.department.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return prisma.department.update({
      where: { id },
      data,
    });
  }

  async deactivate(id: string) {
    return prisma.department.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  async getHierarchy() {
    const departments = await prisma.department.findMany({
      include: {
        head: { select: { id: true, name: true } },
        _count: { select: { employees: true } },
      },
    });
    return departments;
  }
}
export default DepartmentRepository;
