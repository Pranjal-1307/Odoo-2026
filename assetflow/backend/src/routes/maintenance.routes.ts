import { Router } from 'express';
import MaintenanceController from '../controllers/maintenance.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorize } from '../middlewares/auth';
import { uploadPhoto } from '../config/multer';
import {
  createMaintenanceSchema,
  approveMaintenanceSchema,
  assignTechnicianSchema,
  resolveMaintenanceSchema,
} from '../validators/maintenance.validator';

export const maintenanceRouter = Router();
const controller = new MaintenanceController();

maintenanceRouter.get('/', authenticate, (req, res, next) => controller.getAll(req, res, next));
maintenanceRouter.get('/my', authenticate, (req, res, next) => controller.getMyRequests(req, res, next));
maintenanceRouter.get('/stats', authenticate, authorize('ADMIN', 'ASSET_MANAGER'), (req, res, next) => controller.getStats(req, res, next));
maintenanceRouter.get('/:id', authenticate, (req, res, next) => controller.getById(req, res, next));

maintenanceRouter.post('/', authenticate, uploadPhoto, validate(createMaintenanceSchema), (req, res, next) => controller.raise(req, res, next));
maintenanceRouter.patch('/:id/approve', authenticate, authorize('ADMIN', 'ASSET_MANAGER'), validate(approveMaintenanceSchema), (req, res, next) => controller.approveOrReject(req, res, next));
maintenanceRouter.patch('/:id/assign', authenticate, authorize('ADMIN', 'ASSET_MANAGER'), validate(assignTechnicianSchema), (req, res, next) => controller.assignTechnician(req, res, next));
maintenanceRouter.patch('/:id/start', authenticate, (req, res, next) => controller.startWork(req, res, next));
maintenanceRouter.patch('/:id/resolve', authenticate, validate(resolveMaintenanceSchema), (req, res, next) => controller.resolve(req, res, next));

export default maintenanceRouter;
