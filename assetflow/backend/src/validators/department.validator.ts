import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
  headId: z.string().uuid().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();
