import { Router } from 'express';
import AuditController from '../controllers/audit.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorize } from '../middlewares/auth';
import {
  createAuditCycleSchema,
  assignAuditorsSchema,
  verifyAuditItemSchema,
} from '../validators/audit.validator';

export const auditRouter = Router();
const controller = new AuditController();

auditRouter.get('/', authenticate, authorize('ADMIN', 'ASSET_MANAGER'), (req, res, next) => controller.getAllCycles(req, res, next));
auditRouter.get('/my-items', authenticate, (req, res, next) => controller.getMyItems(req, res, next));
auditRouter.get('/:id', authenticate, (req, res, next) => controller.getCycleById(req, res, next));
auditRouter.get('/:id/discrepancies', authenticate, authorize('ADMIN', 'ASSET_MANAGER'), (req, res, next) => controller.getDiscrepancyReport(req, res, next));

auditRouter.post('/', authenticate, authorize('ADMIN'), validate(createAuditCycleSchema), (req, res, next) => controller.createCycle(req, res, next));
auditRouter.patch('/:id/start', authenticate, authorize('ADMIN'), (req, res, next) => controller.startCycle(req, res, next));
auditRouter.post('/:id/assign-auditors', authenticate, authorize('ADMIN'), validate(assignAuditorsSchema), (req, res, next) => controller.assignAuditors(req, res, next));
auditRouter.patch('/items/:itemId/verify', authenticate, validate(verifyAuditItemSchema), (req, res, next) => controller.verifyItem(req, res, next));
auditRouter.patch('/:id/close', authenticate, authorize('ADMIN'), (req, res, next) => controller.closeCycle(req, res, next));

export default auditRouter;
