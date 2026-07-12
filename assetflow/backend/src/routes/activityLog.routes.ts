import { Router } from 'express';
import ActivityLogController from '../controllers/activityLog.controller';
import { authenticate, authorize } from '../middlewares/auth';

export const activityLogRouter = Router();
const controller = new ActivityLogController();

activityLogRouter.get('/', authenticate, authorize('ADMIN'), (req, res, next) => controller.getAll(req, res, next));
activityLogRouter.get('/my', authenticate, (req, res, next) => controller.getMyActivity(req, res, next));
activityLogRouter.get('/:entity/:entityId', authenticate, (req, res, next) => controller.getByEntity(req, res, next));

export default activityLogRouter;
