import { Router } from 'express';
import AssetController from '../controllers/asset.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorize } from '../middlewares/auth';
import { uploadPhoto } from '../config/multer';
import { registerAssetSchema, updateAssetSchema, searchAssetSchema } from '../validators/asset.validator';

export const assetRouter = Router();
const controller = new AssetController();

assetRouter.get('/', authenticate, (req, res, next) => controller.getAll(req, res, next));
assetRouter.get('/search', authenticate, validate(searchAssetSchema, 'query'), (req, res, next) => controller.search(req, res, next));
assetRouter.get('/stats', authenticate, authorize('ADMIN', 'ASSET_MANAGER'), (req, res, next) => controller.getStats(req, res, next));
assetRouter.get('/:id', authenticate, (req, res, next) => controller.getById(req, res, next));
assetRouter.get('/tag/:tag', authenticate, (req, res, next) => controller.getByTag(req, res, next));
assetRouter.get('/:id/history', authenticate, (req, res, next) => controller.getHistory(req, res, next));

// Register supports photo file upload, so run uploadPhoto before validating the body.
assetRouter.post('/', authenticate, authorize('ADMIN', 'ASSET_MANAGER'), uploadPhoto, validate(registerAssetSchema), (req, res, next) => controller.register(req, res, next));
assetRouter.put('/:id', authenticate, authorize('ADMIN', 'ASSET_MANAGER'), validate(updateAssetSchema), (req, res, next) => controller.update(req, res, next));

export default assetRouter;
