import { BookingStatus, AssetStatus } from '@prisma/client';
import BookingRepository from '../repositories/booking.repository';
import prisma from '../config/database';
import { AppError } from '../utils/AppError';
import { logActivity } from '../middlewares/activityLogger';
import { PaginationParams } from '../types';

const bookingRepository = new BookingRepository();

export class BookingService {
  async createBooking(data: {
    assetId: string;
    startTime: Date;
    endTime: Date;
    purpose?: string;
  }, userId: string) {
    // 1. Validate asset
    const asset = await prisma.asset.findUnique({
      where: { id: data.assetId },
    });
    if (!asset) {
      throw AppError.notFound('Asset not found');
    }

    if (!asset.bookable) {
      throw AppError.badRequest('Asset is not available for booking');
    }

    if (asset.status !== AssetStatus.AVAILABLE && asset.status !== AssetStatus.RESERVED) {
      throw AppError.badRequest(`Asset cannot be booked (current status: ${asset.status})`);
    }

    // 2. Check overlap
    const conflict = await bookingRepository.findByAssetAndTimeRange(data.assetId, data.startTime, data.endTime);
    if (conflict) {
      const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const err = AppError.conflict(`Time slot conflicts with an existing booking for ${asset.name} (${formatTime(conflict.startTime)} - ${formatTime(conflict.endTime)} by ${conflict.bookedBy.name})`);
      (err as any).data = {
        conflictingBooking: {
          id: conflict.id,
          startTime: conflict.startTime,
          endTime: conflict.endTime,
          bookedBy: { name: conflict.bookedBy.name },
        },
      };
      throw err;
    }

    // 3. Create booking
    const booking = await bookingRepository.create({
      assetId: data.assetId,
      bookedById: userId,
      startTime: data.startTime,
      endTime: data.endTime,
      purpose: data.purpose,
    });

    // 4. Update asset status
    if (asset.status === AssetStatus.AVAILABLE) {
      await prisma.asset.update({
        where: { id: data.assetId },
        data: { status: AssetStatus.RESERVED },
      });
    }

    // 5. Create notification
    const formatDate = (d: Date) => d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    await prisma.notification.create({
      data: {
        userId,
        title: 'Booking Confirmed',
        message: `Booking confirmed: ${asset.name} on ${formatDate(data.startTime)} ${formatTime(data.startTime)}-${formatTime(data.endTime)}`,
        type: 'BOOKING_CONFIRMED',
        refId: booking.id,
        refType: 'BOOKING',
      },
    });

    // 6. Log activity
    await logActivity({
      userId,
      action: 'BOOK',
      entity: 'Booking',
      entityId: booking.id,
      details: { assetName: asset.name, purpose: data.purpose },
    });

    return booking;
  }

  async cancelBooking(bookingId: string, userId: string, role: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw AppError.notFound('Booking not found');
    }

    // Auth check
    if (booking.bookedById !== userId && role !== 'ADMIN' && role !== 'ASSET_MANAGER') {
      throw AppError.forbidden('You are not authorized to cancel this booking');
    }

    if (booking.status !== BookingStatus.UPCOMING) {
      throw AppError.badRequest('Only upcoming bookings can be cancelled');
    }

    const cancelled = await bookingRepository.cancel(bookingId);

    // Update asset status if no other upcoming/ongoing bookings exist
    const activeBooking = await prisma.booking.findFirst({
      where: {
        assetId: booking.assetId,
        status: { in: [BookingStatus.UPCOMING, BookingStatus.ONGOING] },
      },
    });

    if (!activeBooking) {
      await prisma.asset.update({
        where: { id: booking.assetId },
        data: { status: AssetStatus.AVAILABLE },
      });
    }

    // Notify user
    await prisma.notification.create({
      data: {
        userId: booking.bookedById,
        title: 'Booking Cancelled',
        message: `Your booking for ${booking.asset.name} has been cancelled`,
        type: 'BOOKING_CANCELLED',
        refId: bookingId,
        refType: 'BOOKING',
      },
    });

    // Log activity
    await logActivity({
      userId,
      action: 'CANCEL_BOOKING',
      entity: 'Booking',
      entityId: bookingId,
      details: { assetName: booking.asset.name },
    });

    return cancelled;
  }

  async rescheduleBooking(bookingId: string, newTimes: { startTime: Date; endTime: Date }, userId: string) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw AppError.notFound('Booking not found');
    }

    if (booking.bookedById !== userId) {
      throw AppError.forbidden('You can only reschedule your own bookings');
    }

    if (booking.status !== BookingStatus.UPCOMING) {
      throw AppError.badRequest('Only upcoming bookings can be rescheduled');
    }

    // Check overlap
    const conflict = await bookingRepository.findByAssetAndTimeRange(
      booking.assetId,
      newTimes.startTime,
      newTimes.endTime,
      bookingId
    );

    if (conflict) {
      const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const err = AppError.conflict(`Time slot conflicts with an existing booking for ${booking.asset.name} (${formatTime(conflict.startTime)} - ${formatTime(conflict.endTime)} by ${conflict.bookedBy.name})`);
      (err as any).data = {
        conflictingBooking: {
          id: conflict.id,
          startTime: conflict.startTime,
          endTime: conflict.endTime,
          bookedBy: { name: conflict.bookedBy.name },
        },
      };
      throw err;
    }

    const updated = await bookingRepository.update(bookingId, {
      startTime: newTimes.startTime,
      endTime: newTimes.endTime,
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId,
        title: 'Booking Rescheduled',
        message: `Your booking for ${booking.asset.name} has been rescheduled`,
        type: 'BOOKING_CONFIRMED',
        refId: bookingId,
        refType: 'BOOKING',
      },
    });

    // Log activity
    await logActivity({
      userId,
      action: 'UPDATE',
      entity: 'Booking',
      entityId: bookingId,
      details: { assetName: booking.asset.name },
    });

    return updated;
  }

  async getBookingsForAsset(assetId: string, startDate: Date, endDate: Date) {
    return bookingRepository.findByAssetForCalendar(assetId, startDate, endDate);
  }

  async getMyBookings(userId: string) {
    return bookingRepository.findUpcomingByUser(userId);
  }

  async getAllBookings(params: PaginationParams & { assetId?: string; userId?: string; status?: BookingStatus; date?: string }) {
    await bookingRepository.updateExpiredBookings(); // Auto update status before returning
    return bookingRepository.findAll(params);
  }

  async getBookableAssets() {
    return bookingRepository.getBookableAssets();
  }

  async updateBookingStatuses() {
    await bookingRepository.updateExpiredBookings();
  }
}

export default BookingService;
