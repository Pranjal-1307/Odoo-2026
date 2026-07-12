import { Request, Response, NextFunction } from 'express';
import ActivityLogService from '../services/activityLog.service';
import { successResponse } from '../utils/response';

const service = new ActivityLogService();

export class ActivityLogController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.getActivityLogs({
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        userId: req.query.userId as string,
        entity: req.query.entity as string,
        action: req.query.action as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      });

      res.status(200).json(successResponse('All activity logs retrieved', result.data, result.meta));
    } catch (error) {
      next(error);
    }
  }

  async getByEntity(req: Request, res: Response, next: NextFunction) {
    try {
      const { entity, entityId } = req.params;
      const logs = await service.getActivityByEntity(entity, entityId);
      res.status(200).json(successResponse('Activity logs for entity retrieved', logs));
    } catch (error) {
      next(error);
    }
  }

  async getMyActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');

      const result = await service.getMyActivity(userId, {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      });

      res.status(200).json(successResponse('My activity logs retrieved', result.data, result.meta));
    } catch (error) {
      next(error);
    }
  }
}

export default ActivityLogController;
