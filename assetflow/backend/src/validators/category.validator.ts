import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  warrantyPeriod: z.number().int().positive().optional().nullable(),
  customFields: z.record(z.any()).optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
