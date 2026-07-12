import { z } from 'zod';

export const allocateAssetSchema = z.object({
  assetId: z.string().uuid(),
  allocatedToId: z.string().uuid(),
  expectedReturn: z.string().transform(val => (val ? new Date(val) : null)).optional().nullable(),
  notes: z.string().optional(),
});

export const returnAssetSchema = z.object({
  returnCondition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']),
  returnNotes: z.string().optional(),
});

export const transferRequestSchema = z.object({
  assetId: z.string().uuid(),
  toUserId: z.string().uuid(),
  reason: z.string().min(5, 'Reason is required'),
});

export const resolveTransferSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});
