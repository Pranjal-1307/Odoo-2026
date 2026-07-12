import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth.service';
import { successResponse } from '../utils/response';

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.signup(req.body);
      res.status(201).json(successResponse('Account created successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(successResponse('Login successful', result));
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const user = await authService.getProfile(userId);
      res.status(200).json(successResponse('Profile retrieved successfully', user));
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.status(200).json(successResponse('Token refreshed successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      res.status(200).json(successResponse('Password reset processed', result));
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
