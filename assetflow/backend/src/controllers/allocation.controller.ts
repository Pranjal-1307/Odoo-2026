import { Request, Response, NextFunction } from 'express';
import AllocationService from '../services/allocation.service';
import { successResponse } from '../utils/response';
import { TransferStatus } from '@prisma/client';

const service = new AllocationService();

export class AllocationController {
  async allocate(req: Request, res: Response, next: NextFunction) {
    try {
      const allocatedById = req.user?.userId;
      if (!allocatedById) throw new Error('Not authenticated');
      const result = await service.allocateAsset(req.body, allocatedById);
      res.status(201).json(successResponse('Asset allocated successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async returnAsset(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');
      const result = await service.returnAsset(req.params.id, req.body, userId);
      res.status(200).json(successResponse('Asset returned successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async requestTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const requestedByUserId = req.user?.userId;
      if (!requestedByUserId) throw new Error('Not authenticated');
      const result = await service.requestTransfer(req.body, requestedByUserId);
      res.status(201).json(successResponse('Transfer request created successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async resolveTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const approvedByUserId = req.user?.userId;
      if (!approvedByUserId) throw new Error('Not authenticated');
      const result = await service.resolveTransfer(req.params.id, req.body.status as TransferStatus, approvedByUserId);
      res.status(200).json(successResponse(`Transfer request ${req.body.status.toLowerCase()} successfully`, result));
    } catch (error) {
      next(error);
    }
  }

  async getMyAllocations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');
      const result = await service.getMyAllocations(userId);
      res.status(200).json(successResponse('Allocations retrieved successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async getAllAllocations(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.getAllAllocations({
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        status: req.query.status as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      });
      res.status(200).json(successResponse('All allocations retrieved successfully', result.data, result.meta));
    } catch (error) {
      next(error);
    }
  }

  async getOverdue(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.getOverdueAllocations();
      res.status(200).json(successResponse('Overdue allocations retrieved successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async getPendingTransfers(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.getPendingTransfers();
      res.status(200).json(successResponse('Pending transfers retrieved successfully', result));
    } catch (error) {
      next(error);
    }
  }
}

export default AllocationController;
