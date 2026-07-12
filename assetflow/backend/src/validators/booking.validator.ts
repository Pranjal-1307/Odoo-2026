import { z } from 'zod';

export const createBookingSchema = z.object({
  assetId: z.string().uuid(),
  startTime: z.string().datetime().transform(val => new Date(val)),
  endTime: z.string().datetime().transform(val => new Date(val)),
  purpose: z.string().min(3, 'Purpose is required'),
}).refine(data => data.startTime < data.endTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
}).refine(data => data.startTime > new Date(), {
  message: 'Booking must be in the future',
  path: ['startTime'],
});

export const rescheduleBookingSchema = z.object({
  startTime: z.string().datetime().transform(val => new Date(val)),
  endTime: z.string().datetime().transform(val => new Date(val)),
}).refine(data => data.startTime < data.endTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});
