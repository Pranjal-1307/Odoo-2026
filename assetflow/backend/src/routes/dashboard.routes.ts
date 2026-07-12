import { Router } from 'express';
import DashboardController from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth';

export const dashboardRouter = Router();
const controller = new DashboardController();

dashboardRouter.get('/kpis', authenticate, (req, res, next) => controller.getKPIs(req, res, next));
dashboardRouter.get('/overdue-returns', authenticate, (req, res, next) => controller.getOverdueReturns(req, res, next));
dashboardRouter.get('/upcoming-returns', authenticate, (req, res, next) => controller.getUpcomingReturns(req, res, next));
dashboardRouter.get('/recent-activity', authenticate, (req, res, next) => controller.getRecentActivity(req, res, next));

export default dashboardRouter;
