import { z } from 'zod';

export const createAuditCycleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  departmentId: z.string().uuid().optional().nullable(),
  location: z.string().optional().nullable(),
  startDate: z.string().datetime().transform(val => new Date(val)),
  endDate: z.string().datetime().transform(val => new Date(val)),
}).refine(data => data.startDate < data.endDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const assignAuditorsSchema = z.object({
  auditorIds: z.array(z.string().uuid()).min(1, 'At least one auditor is required'),
});

export const verifyAuditItemSchema = z.object({
  verification: z.enum(['VERIFIED', 'MISSING', 'DAMAGED']),
  remarks: z.string().optional().nullable(),
});
