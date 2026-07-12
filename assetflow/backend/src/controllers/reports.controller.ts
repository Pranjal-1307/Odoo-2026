import { Request, Response, NextFunction } from 'express';
import ReportsService from '../services/reports.service';
import { successResponse } from '../utils/response';

const service = new ReportsService();

export class ReportsController {
  async getAssetUtilization(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, categoryId, departmentId } = req.query;
      if (!startDate || !endDate) {
        throw new Error('startDate and endDate queries are required');
      }

      const report = await service.getAssetUtilizationReport({
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        categoryId: categoryId as string,
        departmentId: departmentId as string,
      });

      res.status(200).json(successResponse('Asset utilization report retrieved', report));
    } catch (error) {
      next(error);
    }
  }

  async getMaintenanceReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, categoryId } = req.query;
      if (!startDate || !endDate) {
        throw new Error('startDate and endDate queries are required');
      }

      const report = await service.getMaintenanceReport({
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        categoryId: categoryId as string,
      });

      res.status(200).json(successResponse('Maintenance report retrieved', report));
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentAllocation(_req: Request, res: Response, next: NextFunction) {
    try {
      const report = await service.getDepartmentAllocationReport();
      res.status(200).json(successResponse('Department allocation report retrieved', report));
    } catch (error) {
      next(error);
    }
  }

  async getBookingHeatmap(req: Request, res: Response, next: NextFunction) {
    try {
      const { assetId, startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        throw new Error('startDate and endDate queries are required');
      }

      const report = await service.getBookingHeatmap({
        assetId: assetId as string,
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      });

      res.status(200).json(successResponse('Booking heatmap retrieved', report));
    } catch (error) {
      next(error);
    }
  }

  async getAssetLifecycle(_req: Request, res: Response, next: NextFunction) {
    try {
      const report = await service.getAssetLifecycleReport();
      res.status(200).json(successResponse('Asset lifecycle report retrieved', report));
    } catch (error) {
      next(error);
    }
  }
}

export default ReportsController;
