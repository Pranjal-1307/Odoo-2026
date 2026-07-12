import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  assetId: z.string().uuid(),
  issue: z.string().min(5, 'Describe the issue in at least 5 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

export const approveMaintenanceSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  notes: z.string().optional(),
});

export const assignTechnicianSchema = z.object({
  technicianId: z.string().uuid(),
});

export const resolveMaintenanceSchema = z.object({
  resolutionNotes: z.string().min(5, 'Resolution notes are required'),
});
