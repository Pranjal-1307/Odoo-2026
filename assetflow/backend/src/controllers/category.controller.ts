import { Request, Response, NextFunction } from 'express';
import CategoryService from '../services/category.service';
import { successResponse } from '../utils/response';

const categoryService = new CategoryService();

export class CategoryController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await categoryService.getAllCategories({
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        search: req.query.search as string,
        status: req.query.status as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      });
      res.status(200).json(successResponse('Categories retrieved successfully', result.data, result.meta));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const cat = await categoryService.getCategoryById(req.params.id);
      res.status(200).json(successResponse('Category retrieved successfully', cat));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');
      const cat = await categoryService.createCategory(req.body, userId);
      res.status(201).json(successResponse('Category created successfully', cat));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');
      const cat = await categoryService.updateCategory(req.params.id, req.body, userId);
      res.status(200).json(successResponse('Category updated successfully', cat));
    } catch (error) {
      next(error);
    }
  }
}

export default CategoryController;
