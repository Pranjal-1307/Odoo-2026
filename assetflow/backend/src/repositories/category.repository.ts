import prisma from '../config/database';
import { PaginationParams } from '../types';

export class CategoryRepository {
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

    const data = await prisma.category.findMany({
      where,
      skip,
      take: limit,
      include: {
        _count: { select: { assets: true } },
      },
      orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'asc' } : { createdAt: 'desc' },
    });

    const total = await prisma.category.count({ where });

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
    return prisma.category.findUnique({
      where: { id },
      include: {
        assets: true,
      },
    });
  }

  async create(data: any) {
    return prisma.category.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }
}
export default CategoryRepository;
