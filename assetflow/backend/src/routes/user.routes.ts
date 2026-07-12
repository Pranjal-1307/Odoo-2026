import { Router } from 'express';
import UserController from '../controllers/user.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorize } from '../middlewares/auth';
import { updateUserSchema, promoteUserSchema } from '../validators/user.validator';

export const userRouter = Router();
const controller = new UserController();

userRouter.get('/', authenticate, authorize('ADMIN', 'ASSET_MANAGER'), (req, res, next) => controller.getAll(req, res, next));
userRouter.get('/:id', authenticate, (req, res, next) => controller.getById(req, res, next));
userRouter.put('/:id', authenticate, authorize('ADMIN'), validate(updateUserSchema), (req, res, next) => controller.update(req, res, next));
userRouter.patch('/:id/promote', authenticate, authorize('ADMIN'), validate(promoteUserSchema), (req, res, next) => controller.promote(req, res, next));
userRouter.patch('/:id/deactivate', authenticate, authorize('ADMIN'), (req, res, next) => controller.deactivate(req, res, next));

export default userRouter;
