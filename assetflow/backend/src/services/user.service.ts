import { UserRole } from '@prisma/client';
import UserRepository from '../repositories/user.repository';
import prisma from '../config/database';
import { AppError } from '../utils/AppError';
import { logActivity } from '../middlewares/activityLogger';
import { PaginationParams } from '../types';

const userRepository = new UserRepository();

export class UserService {
  async getAllUsers(params: PaginationParams & { departmentId?: string; role?: string; status?: string }) {
    return userRepository.findAll(params);
  }

  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user;
  }

  async updateUser(id: string, data: any, adminUserId: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing) {
        throw AppError.conflict('Email is already in use');
      }
    }

    if (data.status === 'INACTIVE' && user.status !== 'INACTIVE') {
      if (user._count.allocationsReceived > 0) {
        throw AppError.badRequest('Cannot deactivate a user with active asset allocations');
      }
    }

    const updated = await userRepository.update(id, data);

    await logActivity({
      userId: adminUserId,
      action: 'UPDATE',
      entity: 'User',
      entityId: id,
      details: { name: updated.name },
    });

    return updated;
  }

  async promoteUser(id: string, role: UserRole, adminUserId: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    const updated = await userRepository.updateRole(id, role);

    // Create Notification
    await prisma.notification.create({
      data: {
        userId: id,
        title: 'Role Promoted',
        message: `You have been promoted to ${role}`,
        type: 'ROLE_PROMOTED',
      },
    });

    // Log Activity
    await logActivity({
      userId: adminUserId,
      action: 'PROMOTE_USER',
      entity: 'User',
      entityId: id,
      details: { name: user.name, role },
    });

    return updated;
  }

  async deactivateUser(id: string, adminUserId: string) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    if (user._count.allocationsReceived > 0) {
      throw AppError.badRequest('Cannot deactivate a user with active asset allocations');
    }

    const updated = await userRepository.update(id, { status: 'INACTIVE' });

    await logActivity({
      userId: adminUserId,
      action: 'DEACTIVATE',
      entity: 'User',
      entityId: id,
      details: { name: user.name },
    });

    return updated;
  }
}

export default UserService;
