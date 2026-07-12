import { z } from 'zod';

export const registerAssetSchema = z.object({
  name: z.string().min(2, 'Asset name is required'),
  categoryId: z.string().uuid('Invalid category'),
  departmentId: z.string().uuid().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  acquisitionDate: z.string().transform(val => (val ? new Date(val) : null)).optional().nullable(),
  acquisitionCost: z.coerce.number().positive().optional().nullable(),
  bookable: z.coerce.boolean().optional(),
});

export const updateAssetSchema = z.object({
  name: z.string().min(2, 'Asset name is required').optional(),
  categoryId: z.string().uuid('Invalid category').optional(),
  departmentId: z.string().uuid().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  acquisitionDate: z.string().transform(val => (val ? new Date(val) : null)).optional().nullable(),
  acquisitionCost: z.coerce.number().positive().optional().nullable(),
  bookable: z.coerce.boolean().optional(),
  status: z.enum(['AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED']).optional(),
});

export const searchAssetSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  status: z.string().optional(),
  location: z.string().optional(),
  bookable: z.string().optional(), // "true" or "false"
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
