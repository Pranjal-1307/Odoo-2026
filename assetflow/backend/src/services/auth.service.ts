import bcrypt from 'bcryptjs';
import AuthRepository from '../repositories/auth.repository';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { logActivity } from '../middlewares/activityLogger';

const authRepository = new AuthRepository();

export class AuthService {
  async signup(data: {
    name: string;
    email: string;
    password?: string; // Standard from client
    phone?: string;
    departmentId?: string | null;
  }) {
    if (!data.password) {
      throw AppError.badRequest('Password is required');
    }

    const existingUser = await authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw AppError.conflict('Email already registered');
    }

    const passwordHash = bcrypt.hashSync(data.password, 10);
    const employeeCode = await authRepository.generateEmployeeCode();

    const user = await authRepository.createUser({
      name: data.name,
      email: data.email,
      passwordHash,
      phone: data.phone,
      departmentId: data.departmentId,
      employeeCode,
    });

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Log activity
    await logActivity({
      userId: user.id,
      action: 'SIGNUP',
      entity: 'User',
      entityId: user.id,
      details: { email: user.email, name: user.name },
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(data: { email: string; password?: string }) {
    if (!data.password) {
      throw AppError.badRequest('Password is required');
    }

    const user = await authRepository.findUserByEmail(data.email);
    if (!user) {
      throw AppError.unauthorized('Invalid credentials');
    }

    const isMatch = bcrypt.compareSync(data.password, user.password);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid credentials');
    }

    if (user.status === 'INACTIVE') {
      throw AppError.forbidden('Account is deactivated');
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Clean user password before returning
    const { password, ...cleanedUser } = user;

    await logActivity({
      userId: user.id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
      details: { email: user.email },
    });

    return {
      user: cleanedUser,
      accessToken,
      refreshToken,
    };
  }

  async getProfile(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user;
  }

  async refreshToken(token: string) {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await authRepository.findUserById(decoded.userId);
      if (!user || user.status === 'INACTIVE') {
        throw AppError.unauthorized('Invalid refresh token');
      }

      const accessToken = generateAccessToken({ userId: user.id, role: user.role });
      return { accessToken };
    } catch (error) {
      throw AppError.unauthorized('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    const user = await authRepository.findUserByEmail(email);
    if (user) {
      // Generate dummy token and log it to console as requested
      const tempToken = Math.random().toString(36).substring(2, 15);
      console.log(`[DEV forgotPassword] Temporary reset token for ${email}: ${tempToken}`);
    }
    return { message: 'If the email exists, a reset link has been sent' };
  }
}

export default AuthService;
