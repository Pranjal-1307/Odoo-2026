import { Request, Response, NextFunction } from 'express';
import DepartmentService from '../services/department.service';
import { successResponse } from '../utils/response';

const departmentService = new DepartmentService();

export class DepartmentController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await departmentService.getAllDepartments({
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        search: req.query.search as string,
        status: req.query.status as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      });
      res.status(200).json(successResponse('Departments retrieved successfully', result.data, result.meta));
    } catch (error) {
      next(error);
    }
  }

  async getHierarchy(_req: Request, res: Response, next: NextFunction) {
    try {
      const hierarchy = await departmentService.getDepartmentHierarchy();
      res.status(200).json(successResponse('Department hierarchy retrieved successfully', hierarchy));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const dept = await departmentService.getDepartmentById(req.params.id);
      res.status(200).json(successResponse('Department retrieved successfully', dept));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');
      const dept = await departmentService.createDepartment(req.body, userId);
      res.status(201).json(successResponse('Department created successfully', dept));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');
      const dept = await departmentService.updateDepartment(req.params.id, req.body, userId);
      res.status(200).json(successResponse('Department updated successfully', dept));
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');
      const dept = await departmentService.deactivateDepartment(req.params.id, userId);
      res.status(200).json(successResponse('Department deactivated successfully', dept));
    } catch (error) {
      next(error);
    }
  }
}

export default DepartmentController;
