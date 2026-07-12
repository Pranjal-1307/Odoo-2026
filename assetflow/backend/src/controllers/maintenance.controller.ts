import { Request, Response, NextFunction } from 'express';
import MaintenanceService from '../services/maintenance.service';
import { successResponse } from '../utils/response';
import { MaintenanceStatus, MaintenancePriority } from '@prisma/client';

const service = new MaintenanceService();

export class MaintenanceController {
  async raise(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');

      let photoUrl = null;
      if (req.file) {
        photoUrl = `/uploads/photos/${req.file.filename}`;
      }

      const request = await service.raiseRequest({
        assetId: req.body.assetId,
        issue: req.body.issue,
        priority: req.body.priority as MaintenancePriority,
        photoUrl,
      }, userId);

      res.status(201).json(successResponse('Maintenance request raised successfully', request));
    } catch (error) {
      next(error);
    }
  }

  async approveOrReject(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');
      
      const { status } = req.body;
      const result = await service.approveOrReject(req.params.id, status, userId);
      res.status(200).json(successResponse(`Maintenance request ${status.toLowerCase()} successfully`, result));
    } catch (error) {
      next(error);
    }
  }

  async assignTechnician(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');

      const result = await service.assignTechnician(req.params.id, req.body.technicianId, userId);
      res.status(200).json(successResponse('Technician assigned successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async startWork(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');

      const result = await service.startWork(req.params.id, userId);
      res.status(200).json(successResponse('Maintenance work started successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async resolve(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');

      const result = await service.resolveRequest(req.params.id, req.body.resolutionNotes, userId);
      res.status(200).json(successResponse('Maintenance request resolved successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.getAllRequests({
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        status: req.query.status as MaintenanceStatus,
        priority: req.query.priority as MaintenancePriority,
        assetId: req.query.assetId as string,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      });
      res.status(200).json(successResponse('All maintenance requests retrieved', result.data, result.meta));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const request = await service.getRequestById(req.params.id);
      res.status(200).json(successResponse('Maintenance request retrieved', request));
    } catch (error) {
      next(error);
    }
  }

  async getMyRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');
      const requests = await service.getMyRequests(userId);
      res.status(200).json(successResponse('My maintenance requests retrieved', requests));
    } catch (error) {
      next(error);
    }
  }

  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await service.getMaintenanceStats();
      res.status(200).json(successResponse('Maintenance stats retrieved', stats));
    } catch (error) {
      next(error);
    }
  }
}

export default MaintenanceController;
