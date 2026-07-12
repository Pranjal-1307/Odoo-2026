import { Request, Response, NextFunction } from 'express';
import UserService from '../services/user.service';
import { successResponse } from '../utils/response';

const userService = new UserService();

export class UserController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.getAllUsers({
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        search: req.query.search as string,
        departmentId: req.query.departmentId as string,
        role: req.query.role as string,
        status: req.query.status as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      });
      res.status(200).json(successResponse('Users retrieved successfully', result.data, result.meta));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.status(200).json(successResponse('User retrieved successfully', user));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user?.userId;
      if (!adminUserId) throw new Error('Not authenticated');
      const user = await userService.updateUser(req.params.id, req.body, adminUserId);
      res.status(200).json(successResponse('User updated successfully', user));
    } catch (error) {
      next(error);
    }
  }

  async promote(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user?.userId;
      if (!adminUserId) throw new Error('Not authenticated');
      const user = await userService.promoteUser(req.params.id, req.body.role, adminUserId);
      res.status(200).json(successResponse('User promoted successfully', user));
    } catch (error) {
      next(error);
    }
  }

  async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user?.userId;
      if (!adminUserId) throw new Error('Not authenticated');
      const user = await userService.deactivateUser(req.params.id, adminUserId);
      res.status(200).json(successResponse('User deactivated successfully', user));
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
