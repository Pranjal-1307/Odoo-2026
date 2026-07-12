import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  refreshTokenSchema,
} from '../validators/auth.validator';

export const authRouter = Router();
const authController = new AuthController();

authRouter.post('/signup', validate(signupSchema), (req, res, next) => authController.signup(req, res, next));
authRouter.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next));
authRouter.get('/profile', authenticate, (req, res, next) => authController.getProfile(req, res, next));
authRouter.post('/refresh-token', validate(refreshTokenSchema), (req, res, next) => authController.refreshToken(req, res, next));
authRouter.post('/forgot-password', validate(forgotPasswordSchema), (req, res, next) => authController.forgotPassword(req, res, next));

export default authRouter;
