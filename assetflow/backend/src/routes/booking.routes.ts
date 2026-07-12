import { Router } from 'express';
import BookingController from '../controllers/booking.controller';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/auth';
import { createBookingSchema, rescheduleBookingSchema } from '../validators/booking.validator';

export const bookingRouter = Router();
const controller = new BookingController();

bookingRouter.get('/', authenticate, (req, res, next) => controller.getAll(req, res, next));
bookingRouter.get('/my', authenticate, (req, res, next) => controller.getMyBookings(req, res, next));
bookingRouter.get('/bookable-assets', authenticate, (req, res, next) => controller.getBookableAssets(req, res, next));
bookingRouter.get('/asset/:assetId', authenticate, (req, res, next) => controller.getForAsset(req, res, next));

bookingRouter.post('/', authenticate, validate(createBookingSchema), (req, res, next) => controller.create(req, res, next));
bookingRouter.patch('/:id/cancel', authenticate, (req, res, next) => controller.cancel(req, res, next));
bookingRouter.patch('/:id/reschedule', authenticate, validate(rescheduleBookingSchema), (req, res, next) => controller.reschedule(req, res, next));

export default bookingRouter;
