import prisma from '../config/database';
import { BookingStatus, AssetStatus } from '@prisma/client';
import { PaginationParams } from '../types';

export class BookingRepository {
  async findAll(params: PaginationParams & { assetId?: string; userId?: string; status?: BookingStatus; date?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.assetId) {
      where.assetId = params.assetId;
    }
    if (params.userId) {
      where.bookedById = params.userId;
    }
    if (params.status) {
      where.status = params.status;
    }
    if (params.date) {
      const startOfDay = new Date(params.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(params.date);
      endOfDay.setHours(23, 59, 59, 999);
      where.startTime = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const data = await prisma.booking.findMany({
      where,
      skip,
      take: limit,
      include: {
        asset: true,
        bookedBy: { select: { id: true, name: true, employeeCode: true } },
      },
      orderBy: params.sortBy ? { [params.sortBy]: params.sortOrder || 'desc' } : { startTime: 'asc' },
    });

    const total = await prisma.booking.count({ where });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        asset: true,
        bookedBy: { select: { id: true, name: true, employeeCode: true } },
      },
    });
  }

  async findByAssetAndTimeRange(assetId: string, startTime: Date, endTime: Date, excludeId?: string) {
    return prisma.booking.findFirst({
      where: {
        assetId,
        id: excludeId ? { not: excludeId } : undefined,
        status: { notIn: [BookingStatus.CANCELLED, BookingStatus.COMPLETED] },
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      include: {
        bookedBy: { select: { id: true, name: true } },
      },
    });
  }

  async findUpcomingByUser(userId: string) {
    return prisma.booking.findMany({
      where: {
        bookedById: userId,
        status: BookingStatus.UPCOMING,
      },
      include: {
        asset: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findByAssetForCalendar(assetId: string, startDate: Date, endDate: Date) {
    return prisma.booking.findMany({
      where: {
        assetId,
        status: { notIn: [BookingStatus.CANCELLED] },
        startTime: { gte: startDate },
        endTime: { lte: endDate },
      },
      include: {
        bookedBy: { select: { id: true, name: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async create(data: {
    assetId: string;
    bookedById: string;
    startTime: Date;
    endTime: Date;
    purpose?: string;
  }) {
    return prisma.booking.create({
      data: {
        assetId: data.assetId,
        bookedById: data.bookedById,
        startTime: data.startTime,
        endTime: data.endTime,
        purpose: data.purpose || null,
        status: BookingStatus.UPCOMING,
      },
      include: {
        asset: true,
        bookedBy: { select: { id: true, name: true, employeeCode: true } },
      },
    });
  }

  async update(id: string, data: any) {
    return prisma.booking.update({
      where: { id },
      data,
      include: {
        asset: true,
        bookedBy: { select: { id: true, name: true, employeeCode: true } },
      },
    });
  }

  async cancel(id: string) {
    return prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: {
        asset: true,
        bookedBy: { select: { id: true, name: true } },
      },
    });
  }

  async updateExpiredBookings() {
    const now = new Date();

    // UPCOMING -> ONGOING
    await prisma.booking.updateMany({
      where: {
        status: BookingStatus.UPCOMING,
        startTime: { lte: now },
      },
      data: {
        status: BookingStatus.ONGOING,
      },
    });

    // ONGOING -> COMPLETED
    await prisma.booking.updateMany({
      where: {
        status: BookingStatus.ONGOING,
        endTime: { lte: now },
      },
      data: {
        status: BookingStatus.COMPLETED,
      },
    });
  }

  async getActiveBookingCount() {
    return prisma.booking.count({
      where: {
        status: BookingStatus.ONGOING,
      },
    });
  }

  async getBookableAssets() {
    return prisma.asset.findMany({
      where: {
        bookable: true,
        status: { in: [AssetStatus.AVAILABLE, AssetStatus.RESERVED] },
      },
      include: {
        category: true,
      },
    });
  }
}
export default BookingRepository;
