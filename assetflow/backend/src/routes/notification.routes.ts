import { Router } from 'express';
import NotificationController from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth';

export const notificationRouter = Router();
const controller = new NotificationController();

notificationRouter.get('/', authenticate, (req, res, next) => controller.getAll(req, res, next));
notificationRouter.get('/unread-count', authenticate, (req, res, next) => controller.getUnreadCount(req, res, next));
notificationRouter.patch('/:id/read', authenticate, (req, res, next) => controller.markAsRead(req, res, next));
notificationRouter.patch('/read-all', authenticate, (req, res, next) => controller.markAllAsRead(req, res, next));

export default notificationRouter;
