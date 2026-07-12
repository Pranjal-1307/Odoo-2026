import { Request, Response, NextFunction } from 'express';
import NotificationService from '../services/notification.service';
import { successResponse } from '../utils/response';

const service = new NotificationService();

export class NotificationController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');

      const result = await service.getNotifications(userId, {
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
        isRead: req.query.isRead as string,
      });

      res.status(200).json(successResponse('Notifications retrieved successfully', result.data, result.meta));
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');

      const result = await service.getUnreadCount(userId);
      res.status(200).json(successResponse('Unread notification count retrieved', result));
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');

      const result = await service.markAsRead(req.params.id, userId);
      res.status(200).json(successResponse('Notification marked as read', result));
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');

      await service.markAllAsRead(userId);
      res.status(200).json(successResponse('All notifications marked as read'));
    } catch (error) {
      next(error);
    }
  }
}

export default NotificationController;
