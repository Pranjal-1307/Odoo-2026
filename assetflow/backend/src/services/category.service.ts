import CategoryRepository from '../repositories/category.repository';
import prisma from '../config/database';
import { AppError } from '../utils/AppError';
import { logActivity } from '../middlewares/activityLogger';
import { PaginationParams } from '../types';

const categoryRepository = new CategoryRepository();

export class CategoryService {
  async getAllCategories(params: PaginationParams & { status?: string }) {
    return categoryRepository.findAll(params);
  }

  async getCategoryById(id: string) {
    const cat = await categoryRepository.findById(id);
    if (!cat) {
      throw AppError.notFound('Category not found');
    }
    return cat;
  }

  async createCategory(data: any, userId: string) {
    const existing = await prisma.category.findUnique({
      where: { name: data.name },
    });
    if (existing) {
      throw AppError.conflict('Category with this name already exists');
    }

    const cat = await categoryRepository.create(data);

    await logActivity({
      userId,
      action: 'CREATE',
      entity: 'Category',
      entityId: cat.id,
      details: { name: cat.name },
    });

    return cat;
  }

  async updateCategory(id: string, data: any, userId: string) {
    const cat = await categoryRepository.findById(id);
    if (!cat) {
      throw AppError.notFound('Category not found');
    }

    if (data.name && data.name !== cat.name) {
      const existing = await prisma.category.findUnique({
        where: { name: data.name },
      });
      if (existing) {
        throw AppError.conflict('Category with this name already exists');
      }
    }

    if (data.status === 'INACTIVE' && cat.status !== 'INACTIVE') {
      const activeAssets = cat.assets.filter(a => !['RETIRED', 'DISPOSED'].includes(a.status));
      if (activeAssets.length > 0) {
        throw AppError.badRequest('Cannot deactivate category with active assets');
      }
    }

    const updated = await categoryRepository.update(id, data);

    await logActivity({
      userId,
      action: 'UPDATE',
      entity: 'Category',
      entityId: id,
      details: { name: updated.name },
    });

    return updated;
  }
}

export default CategoryService;
