import { Request, Response, NextFunction } from 'express';
import AssetService from '../services/asset.service';
import { successResponse } from '../utils/response';
import { AssetCondition } from '@prisma/client';

const assetService = new AssetService();

export class AssetController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');

      let photoUrl = null;
      if (req.file) {
        photoUrl = `/uploads/photos/${req.file.filename}`;
      }

      // Convert values appropriately (e.g. from multipart form)
      const data = {
        name: req.body.name,
        categoryId: req.body.categoryId,
        departmentId: req.body.departmentId || null,
        serialNumber: req.body.serialNumber || null,
        condition: req.body.condition as AssetCondition,
        location: req.body.location,
        description: req.body.description,
        acquisitionDate: req.body.acquisitionDate ? new Date(req.body.acquisitionDate) : null,
        acquisitionCost: req.body.acquisitionCost ? parseFloat(req.body.acquisitionCost) : null,
        bookable: req.body.bookable === 'true' || req.body.bookable === true,
        photoUrl,
      };

      const asset = await assetService.registerAsset(data, userId);
      res.status(201).json(successResponse('Asset registered successfully', asset));
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await assetService.getAllAssets({
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        search: req.query.search as string,
        categoryId: req.query.categoryId as string,
        departmentId: req.query.departmentId as string,
        status: req.query.status as string,
        location: req.query.location as string,
        bookable: req.query.bookable as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      });
      res.status(200).json(successResponse('Assets retrieved successfully', result.data, result.meta));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = await assetService.getAssetById(req.params.id);
      res.status(200).json(successResponse('Asset retrieved successfully', asset));
    } catch (error) {
      next(error);
    }
  }

  async getByTag(req: Request, res: Response, next: NextFunction) {
    try {
      const asset = await assetService.getAssetByTag(req.params.tag);
      res.status(200).json(successResponse('Asset retrieved successfully', asset));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) throw new Error('Not authenticated');
      const asset = await assetService.updateAsset(req.params.id, req.body, userId);
      res.status(200).json(successResponse('Asset updated successfully', asset));
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const timeline = await assetService.getAssetHistory(req.params.id);
      res.status(200).json(successResponse('Asset history retrieved successfully', timeline));
    } catch (error) {
      next(error);
    }
  }

  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await assetService.getAssetStats();
      res.status(200).json(successResponse('Asset statistics retrieved successfully', stats));
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await assetService.getAllAssets({
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        search: req.query.search as string,
        categoryId: req.query.categoryId as string,
        departmentId: req.query.departmentId as string,
        status: req.query.status as string,
        location: req.query.location as string,
        bookable: req.query.bookable as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      });
      res.status(200).json(successResponse('Asset search results', result.data, result.meta));
    } catch (error) {
      next(error);
    }
  }
}

export default AssetController;
