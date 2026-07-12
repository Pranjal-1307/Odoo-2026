import { Request, Response, NextFunction } from 'express';
import DashboardService from '../services/dashboard.service';
import { successResponse } from '../utils/response';

const service = new DashboardService();

export class DashboardController {
  async getKPIs(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role;
      if (!userId || !role) throw new Error('Not authenticated');

      const kpis = await service.getDashboardKPIs(userId, role);
      res.status(200).json(successResponse('Dashboard KPIs retrieved successfully', kpis));
    } catch (error) {
      next(error);
    }
  }

  async getOverdueReturns(_req: Request, res: Response, next: NextFunction) {
    try {
      const list = await service.getOverdueReturnsList();
      res.status(200).json(successResponse('Overdue returns retrieved successfully', list));
    } catch (error) {
      next(error);
    }
  }

  async getUpcomingReturns(_req: Request, res: Response, next: NextFunction) {
    try {
      const list = await service.getUpcomingReturnsList();
      res.status(200).json(successResponse('Upcoming returns retrieved successfully', list));
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role;
      if (!userId || !role) throw new Error('Not authenticated');

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const activity = await service.getRecentActivity(userId, role, limit);
      res.status(200).json(successResponse('Recent activity retrieved successfully', activity));
    } catch (error) {
      next(error);
    }
  }
}

export default DashboardController;
