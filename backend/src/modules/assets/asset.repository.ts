import prisma from '../../lib/prisma';
import { CreateAssetDTO, UpdateAssetDTO } from './asset.validator';
import { AssetCategory, AssetStatus, AssetCondition } from '@prisma/client';

const assetInclude = {
  department: {
    select: {
      id: true,
      name: true,
      code: true,
      officeLocation: true,
      building: true,
      floor: true,
    },
  },
  _count: {
    select: {
      assignments: true,
      maintenanceTickets: true,
    },
  },
};

export class AssetRepository {
  async findMany(params: {
    search?: string;
    category?: string;
    status?: string;
    condition?: string;
    departmentId?: string;
    skip?: number;
    take?: number;
  }) {
    const { search, category, status, condition, departmentId, skip, take } = params;

    const where: any = {};

    if (category && category !== 'all') {
      where.category = category as AssetCategory;
    }

    if (status && status !== 'all') {
      where.status = status as AssetStatus;
    }

    if (condition && condition !== 'all') {
      where.condition = condition as AssetCondition;
    }

    if (departmentId && departmentId !== 'all') {
      where.departmentId = departmentId;
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { assetCode: { contains: term, mode: 'insensitive' } },
        { name: { contains: term, mode: 'insensitive' } },
        { brand: { contains: term, mode: 'insensitive' } },
        { model: { contains: term, mode: 'insensitive' } },
        { serialNumber: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: assetInclude,
      }),
      prisma.asset.count({ where }),
    ]);

    return { assets, total };
  }

  async findById(id: string) {
    return prisma.asset.findUnique({
      where: { id },
      include: assetInclude,
    });
  }

  async findByAssetCode(assetCode: string) {
    return prisma.asset.findUnique({ where: { assetCode } });
  }

  async findBySerialNumber(serialNumber: string) {
    return prisma.asset.findUnique({ where: { serialNumber } });
  }

  async create(data: CreateAssetDTO) {
    return prisma.asset.create({
      data: {
        assetCode: data.assetCode,
        name: data.name,
        category: data.category as AssetCategory,
        brand: data.brand ?? null,
        model: data.model ?? null,
        serialNumber: data.serialNumber,
        status: (data.status as AssetStatus) ?? 'AVAILABLE',
        condition: (data.condition as AssetCondition) ?? 'GOOD',
        departmentId: data.departmentId ?? null,
        location: data.location ?? null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchasePrice: data.purchasePrice ?? null,
        warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
        notes: data.notes ?? null,
      },
      include: assetInclude,
    });
  }

  async update(id: string, data: UpdateAssetDTO) {
    return prisma.asset.update({
      where: { id },
      data: {
        ...(data.assetCode !== undefined && { assetCode: data.assetCode }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.category !== undefined && { category: data.category as AssetCategory }),
        ...(data.brand !== undefined && { brand: data.brand }),
        ...(data.model !== undefined && { model: data.model }),
        ...(data.serialNumber !== undefined && { serialNumber: data.serialNumber }),
        ...(data.status !== undefined && { status: data.status as AssetStatus }),
        ...(data.condition !== undefined && { condition: data.condition as AssetCondition }),
        ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.purchaseDate !== undefined && {
          purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        }),
        ...(data.purchasePrice !== undefined && { purchasePrice: data.purchasePrice }),
        ...(data.warrantyExpiry !== undefined && {
          warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: assetInclude,
    });
  }

  async updateStatus(id: string, status: AssetStatus) {
    return prisma.asset.update({
      where: { id },
      data: { status },
      include: assetInclude,
    });
  }
}

export const assetRepository = new AssetRepository();
