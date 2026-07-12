import { Router } from 'express';
import DepartmentController from '../controllers/department.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorize } from '../middlewares/auth';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/department.validator';

export const departmentRouter = Router();
const controller = new DepartmentController();

departmentRouter.get('/', authenticate, authorize('ADMIN'), (req, res, next) => controller.getAll(req, res, next));
departmentRouter.get('/hierarchy', authenticate, authorize('ADMIN'), (req, res, next) => controller.getHierarchy(req, res, next));
departmentRouter.get('/:id', authenticate, authorize('ADMIN', 'DEPARTMENT_HEAD'), (req, res, next) => controller.getById(req, res, next));
departmentRouter.post('/', authenticate, authorize('ADMIN'), validate(createDepartmentSchema), (req, res, next) => controller.create(req, res, next));
departmentRouter.put('/:id', authenticate, authorize('ADMIN'), validate(updateDepartmentSchema), (req, res, next) => controller.update(req, res, next));
departmentRouter.patch('/:id/deactivate', authenticate, authorize('ADMIN'), (req, res, next) => controller.deactivate(req, res, next));

export default departmentRouter;
