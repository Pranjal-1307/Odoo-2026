import { AssetStatus, AssetCondition } from '@prisma/client';
import AssetRepository, { AssetSearchParams } from '../repositories/asset.repository';
import prisma from '../config/database';
import { generateAssetTag } from '../utils/assetTag';
import { generateQRCode } from '../utils/qrCode';
import { AppError } from '../utils/AppError';
import { logActivity } from '../middlewares/activityLogger';
import { isValidTransition } from '../utils/assetLifecycle';

const assetRepository = new AssetRepository();

export class AssetService {
  async registerAsset(data: {
    name: string;
    categoryId: string;
    departmentId?: string | null;
    serialNumber?: string | null;
    condition?: AssetCondition;
    location?: string;
    description?: string;
    acquisitionDate?: Date | null;
    acquisitionCost?: number | null;
    bookable?: boolean;
    photoUrl?: string | null;
  }, userId: string) {
    // 1. Validate category exists and is ACTIVE
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category || category.status !== 'ACTIVE') {
      throw AppError.badRequest('Category does not exist or is inactive');
    }

    // 2. Uniqueness of serialNumber
    if (data.serialNumber) {
      const existing = await prisma.asset.findUnique({
        where: { serialNumber: data.serialNumber },
      });
      if (existing) {
        throw AppError.conflict('Serial number already registered');
      }
    }

    // 3. Generate asset tag
    const assetTag = await generateAssetTag();

    // 4. Generate QR code data URL
    const qrCode = await generateQRCode(assetTag);

    // 5. Create asset
    const asset = await assetRepository.create({
      assetTag,
      name: data.name,
      serialNumber: data.serialNumber,
      categoryId: data.categoryId,
      departmentId: data.departmentId,
      status: AssetStatus.AVAILABLE,
      condition: data.condition || AssetCondition.NEW,
      location: data.location,
      description: data.description,
      acquisitionDate: data.acquisitionDate,
      acquisitionCost: data.acquisitionCost,
      bookable: data.bookable,
      photoUrl: data.photoUrl,
      qrCode,
      createdById: userId,
    });

    // 6. Log activity
    await logActivity({
      userId,
      action: 'CREATE',
      entity: 'Asset',
      entityId: asset.id,
      details: { assetTag, name: asset.name },
    });

    return asset;
  }

  async getAllAssets(params: AssetSearchParams) {
    return assetRepository.findAll(params);
  }

  async getAssetById(id: string) {
    const asset = await assetRepository.findById(id);
    if (!asset) {
      throw AppError.notFound('Asset not found');
    }
    return asset;
  }

  async getAssetByTag(tag: string) {
    const asset = await assetRepository.findByAssetTag(tag);
    if (!asset) {
      throw AppError.notFound(`Asset with tag ${tag} not found`);
    }
    return asset;
  }

  async updateAsset(id: string, data: any, userId: string) {
    const asset = await prisma.asset.findUnique({
      where: { id },
    });
    if (!asset) {
      throw AppError.notFound('Asset not found');
    }

    // Validate lifecycle transition
    if (data.status && data.status !== asset.status) {
      const allowed = isValidTransition(asset.status, data.status);
      if (!allowed) {
        throw AppError.badRequest(`Invalid status transition from ${asset.status} to ${data.status}`);
      }
    }

    // Check serial number uniqueness if changed
    if (data.serialNumber && data.serialNumber !== asset.serialNumber) {
      const existing = await prisma.asset.findUnique({
        where: { serialNumber: data.serialNumber },
      });
      if (existing) {
        throw AppError.conflict('Serial number already registered');
      }
    }

    const updated = await assetRepository.update(id, data);

    await logActivity({
      userId,
      action: 'UPDATE',
      entity: 'Asset',
      entityId: id,
      details: { name: updated.name, status: updated.status },
    });

    return updated;
  }

  async getAssetHistory(id: string) {
    const asset = await prisma.asset.findUnique({ where: { id }, select: { id: true, name: true, assetTag: true } });
    if (!asset) {
      throw AppError.notFound('Asset not found');
    }
    const history = await assetRepository.getAssetHistory(id);
    return {
      asset,
      ...history,
    };
  }

  async getAssetStats() {
    return assetRepository.getAssetStats();
  }
}

export default AssetService;
