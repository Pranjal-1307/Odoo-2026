import { Request, Response, NextFunction } from 'express';
import BookingService from '../services/booking.service';
import { successResponse } from '../utils/response';
import { BookingStatus } from '@prisma/client';

const service = new BookingService();

export class BookingController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');
      const booking = await service.createBooking(req.body, userId);
      res.status(201).json(successResponse('Booking confirmed', booking));
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const role = req.user?.role;
      if (!userId || !role) throw new Error('Not authenticated');
      const result = await service.cancelBooking(req.params.id, userId, role);
      res.status(200).json(successResponse('Booking cancelled successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async reschedule(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');
      const result = await service.rescheduleBooking(req.params.id, req.body, userId);
      res.status(200).json(successResponse('Booking rescheduled successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async getForAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        throw new Error('startDate and endDate queries are required');
      }
      const bookings = await service.getBookingsForAsset(
        req.params.assetId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.status(200).json(successResponse('Asset bookings retrieved', bookings));
    } catch (error) {
      next(error);
    }
  }

  async getMyBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');
      const bookings = await service.getMyBookings(userId);
      res.status(200).json(successResponse('My bookings retrieved', bookings));
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.getAllBookings({
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        assetId: req.query.assetId as string,
        userId: req.query.userId as string,
        status: req.query.status as BookingStatus,
        date: req.query.date as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      });
      res.status(200).json(successResponse('All bookings retrieved', result.data, result.meta));
    } catch (error) {
      next(error);
    }
  }

  async getBookableAssets(_req: Request, res: Response, next: NextFunction) {
    try {
      const assets = await service.getBookableAssets();
      res.status(200).json(successResponse('Bookable assets retrieved', assets));
    } catch (error) {
      next(error);
    }
  }
}

export default BookingController;
