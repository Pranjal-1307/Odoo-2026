import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  departmentId: z.string().uuid().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const promoteUserSchema = z.object({
  role: z.enum(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE']),
});
