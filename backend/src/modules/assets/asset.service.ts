import prisma from '../../lib/prisma';
import { assetRepository, AssetRepository } from './asset.repository';
import { CreateAssetDTO, UpdateAssetDTO, AssetQueryDTO, WORKFLOW_CONTROLLED_STATUSES } from './asset.validator';
import { AssetStatus } from '@prisma/client';

export class AppError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode = 400, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class AssetService {
  constructor(private repo: AssetRepository = assetRepository) {}

  private formatAsset(asset: any) {
    if (!asset) return null;
    return {
      id: asset.id,
      assetCode: asset.assetCode,
      name: asset.name,
      category: asset.category,
      brand: asset.brand,
      model: asset.model,
      serialNumber: asset.serialNumber,
      status: asset.status,
      condition: asset.condition,
      departmentId: asset.departmentId,
      department: asset.department,
      location: asset.location,
      purchaseDate: asset.purchaseDate,
      purchasePrice: asset.purchasePrice ? Number(asset.purchasePrice) : null,
      warrantyExpiry: asset.warrantyExpiry,
      notes: asset.notes,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
      _count: asset._count,
    };
  }

  async getAssets(query: AssetQueryDTO) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const { assets, total } = await this.repo.findMany({
      search: query.search,
      category: query.category,
      status: query.status,
      condition: query.condition,
      departmentId: query.departmentId,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      assets: assets.map((a) => this.formatAsset(a)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async getAssetById(id: string) {
    const asset = await this.repo.findById(id);
    if (!asset) {
      throw new AppError(`Asset with ID '${id}' not found`, 404);
    }
    return this.formatAsset(asset);
  }

  async createAsset(data: CreateAssetDTO) {
    // 1. Check unique assetCode
    const existingCode = await this.repo.findByAssetCode(data.assetCode);
    if (existingCode) {
      throw new AppError(`Asset code '${data.assetCode}' is already in use`, 409);
    }

    // 2. Check unique serialNumber
    const existingSerial = await this.repo.findBySerialNumber(data.serialNumber);
    if (existingSerial) {
      throw new AppError(`Serial number '${data.serialNumber}' is already registered`, 409);
    }

    // 3. Verify department exists if provided
    if (data.departmentId) {
      const dept = await prisma.department.findUnique({ where: { id: data.departmentId } });
      if (!dept) {
        throw new AppError(`Department with ID '${data.departmentId}' not found`, 404);
      }
    }

    // Always create assets as AVAILABLE — status is workflow-controlled
    const created = await this.repo.create({ ...data, status: 'AVAILABLE' } as any);
    return this.formatAsset(created);
  }

  async updateAsset(id: string, data: UpdateAssetDTO) {
    const current = await this.repo.findById(id);
    if (!current) {
      throw new AppError(`Asset with ID '${id}' not found`, 404);
    }

    // Check assetCode uniqueness if changed
    if (data.assetCode && data.assetCode !== current.assetCode) {
      const taken = await this.repo.findByAssetCode(data.assetCode);
      if (taken) {
        throw new AppError(`Asset code '${data.assetCode}' is already in use`, 409);
      }
    }

    // Check serialNumber uniqueness if changed
    if (data.serialNumber && data.serialNumber !== current.serialNumber) {
      const taken = await this.repo.findBySerialNumber(data.serialNumber);
      if (taken) {
        throw new AppError(`Serial number '${data.serialNumber}' is already registered`, 409);
      }
    }

    // Verify department exists if changed
    if (data.departmentId && data.departmentId !== current.departmentId) {
      const dept = await prisma.department.findUnique({ where: { id: data.departmentId } });
      if (!dept) {
        throw new AppError(`Department with ID '${data.departmentId}' not found`, 404);
      }
    }

    // Guard: block setting workflow-controlled statuses through PUT
    if (data.status && (WORKFLOW_CONTROLLED_STATUSES as readonly string[]).includes(data.status)) {
      throw new AppError(
        `Status '${data.status}' is controlled by the workflow and cannot be set manually. Use asset assignment or maintenance modules.`,
        422,
      );
    }

    const updated = await this.repo.update(id, data);
    return this.formatAsset(updated);
  }

  async updateStatus(id: string, status: string) {
    const current = await this.repo.findById(id);
    if (!current) {
      throw new AppError(`Asset with ID '${id}' not found`, 404);
    }

    // Only RETIRED and DISPOSED are manually settable
    if ((WORKFLOW_CONTROLLED_STATUSES as readonly string[]).includes(status)) {
      throw new AppError(
        `Status '${status}' is controlled by the workflow and cannot be set manually.`,
        422,
      );
    }

    const updated = await this.repo.updateStatus(id, status as AssetStatus);
    return this.formatAsset(updated);
  }
}

export const assetService = new AssetService();
