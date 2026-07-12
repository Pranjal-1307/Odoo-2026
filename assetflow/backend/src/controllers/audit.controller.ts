import { Request, Response, NextFunction } from 'express';
import AuditService from '../services/audit.service';
import { successResponse } from '../utils/response';
import { AuditCycleStatus, AuditVerification } from '@prisma/client';

const service = new AuditService();

export class AuditController {
  async createCycle(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');

      const data = {
        title: req.body.title,
        departmentId: req.body.departmentId || null,
        location: req.body.location || null,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
      };

      const result = await service.createAuditCycle(data, userId);
      res.status(201).json(successResponse('Audit cycle created successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async startCycle(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');

      const result = await service.startAuditCycle(req.params.id, userId);
      res.status(200).json(successResponse('Audit cycle started successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async assignAuditors(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');

      const result = await service.assignAuditors(req.params.id, req.body.auditorIds, userId);
      res.status(200).json(successResponse('Auditors assigned and assets distributed successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async verifyItem(req: Request, res: Response, next: NextFunction) {
    try {
      const auditorId = req.user?.userId;
      if (!auditorId) throw new Error('Not authenticated');

      const { verification, remarks } = req.body;
      const result = await service.verifyItem(req.params.itemId, verification as AuditVerification, remarks, auditorId);
      res.status(200).json(successResponse('Audit item verified successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async getDiscrepancyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await service.getDiscrepancyReport(req.params.id);
      res.status(200).json(successResponse('Discrepancy report retrieved successfully', report));
    } catch (error) {
      next(error);
    }
  }

  async closeCycle(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');

      const result = await service.closeAuditCycle(req.params.id, userId);
      res.status(200).json(successResponse('Audit cycle closed and assets updated successfully', result));
    } catch (error) {
      next(error);
    }
  }

  async getAllCycles(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.getAllCycles({
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        status: req.query.status as AuditCycleStatus,
        departmentId: req.query.departmentId as string,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      });
      res.status(200).json(successResponse('All audit cycles retrieved', result.data, result.meta));
    } catch (error) {
      next(error);
    }
  }

  async getCycleById(req: Request, res: Response, next: NextFunction) {
    try {
      const cycle = await service.getCycleById(req.params.id);
      res.status(200).json(successResponse('Audit cycle retrieved', cycle));
    } catch (error) {
      next(error);
    }
  }

  async getMyItems(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');

      const items = await service.getMyAuditItems(userId);
      res.status(200).json(successResponse('My audit items retrieved', items));
    } catch (error) {
      next(error);
    }
  }
}

export default AuditController;
