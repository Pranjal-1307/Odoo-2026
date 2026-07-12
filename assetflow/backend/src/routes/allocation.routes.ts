import { Router } from 'express';
import AllocationController from '../controllers/allocation.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorize } from '../middlewares/auth';
import {
  allocateAssetSchema,
  returnAssetSchema,
  transferRequestSchema,
  resolveTransferSchema,
} from '../validators/allocation.validator';

export const allocationRouter = Router();
const controller = new AllocationController();

allocationRouter.get('/', authenticate, authorize('ADMIN', 'ASSET_MANAGER'), (req, res, next) => controller.getAllAllocations(req, res, next));
allocationRouter.get('/my', authenticate, (req, res, next) => controller.getMyAllocations(req, res, next));
allocationRouter.get('/overdue', authenticate, authorize('ADMIN', 'ASSET_MANAGER'), (req, res, next) => controller.getOverdue(req, res, next));
allocationRouter.get('/transfers/pending', authenticate, authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), (req, res, next) => controller.getPendingTransfers(req, res, next));

allocationRouter.post('/allocate', authenticate, authorize('ADMIN', 'ASSET_MANAGER'), validate(allocateAssetSchema), (req, res, next) => controller.allocate(req, res, next));
allocationRouter.patch('/:id/return', authenticate, validate(returnAssetSchema), (req, res, next) => controller.returnAsset(req, res, next));
allocationRouter.post('/transfer', authenticate, validate(transferRequestSchema), (req, res, next) => controller.requestTransfer(req, res, next));
allocationRouter.patch('/transfer/:id/resolve', authenticate, authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), validate(resolveTransferSchema), (req, res, next) => controller.resolveTransfer(req, res, next));

export default allocationRouter;
