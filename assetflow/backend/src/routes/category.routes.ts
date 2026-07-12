import { Router } from 'express';
import CategoryController from '../controllers/category.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorize } from '../middlewares/auth';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';

export const categoryRouter = Router();
const controller = new CategoryController();

categoryRouter.get('/', authenticate, (req, res, next) => controller.getAll(req, res, next));
categoryRouter.get('/:id', authenticate, (req, res, next) => controller.getById(req, res, next));
categoryRouter.post('/', authenticate, authorize('ADMIN'), validate(createCategorySchema), (req, res, next) => controller.create(req, res, next));
categoryRouter.put('/:id', authenticate, authorize('ADMIN'), validate(updateCategorySchema), (req, res, next) => controller.update(req, res, next));

export default categoryRouter;
