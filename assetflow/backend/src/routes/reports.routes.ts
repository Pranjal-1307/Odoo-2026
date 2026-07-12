import { Router } from 'express';
import ReportsController from '../controllers/reports.controller';
import { authenticate, authorize } from '../middlewares/auth';

export const reportsRouter = Router();
const controller = new ReportsController();

reportsRouter.get('/asset-utilization', authenticate, authorize('ADMIN', 'ASSET_MANAGER'), (req, res, next) => controller.getAssetUtilization(req, res, next));
reportsRouter.get('/maintenance', authenticate, authorize('ADMIN', 'ASSET_MANAGER'), (req, res, next) => controller.getMaintenanceReport(req, res, next));
reportsRouter.get('/department-allocation', authenticate, authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), (req, res, next) => controller.getDepartmentAllocation(req, res, next));
reportsRouter.get('/booking-heatmap', authenticate, authorize('ADMIN', 'ASSET_MANAGER'), (req, res, next) => controller.getBookingHeatmap(req, res, next));
reportsRouter.get('/asset-lifecycle', authenticate, authorize('ADMIN', 'ASSET_MANAGER'), (req, res, next) => controller.getAssetLifecycle(req, res, next));

export default reportsRouter;
