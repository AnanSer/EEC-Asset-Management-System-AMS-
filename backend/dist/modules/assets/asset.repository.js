"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetRepository = exports.AssetRepository = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
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
    assignments: {
        where: { isCurrent: true },
        include: {
            employee: {
                select: {
                    id: true,
                    employeeId: true,
                    firstName: true,
                    lastName: true,
                    jobTitle: true,
                    department: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            },
        },
        take: 1,
    },
    _count: {
        select: {
            assignments: true,
            maintenanceTickets: true,
        },
    },
};
class AssetRepository {
    async findMany(params) {
        const { search, category, status, condition, departmentId, skip, take } = params;
        const where = {};
        if (category && category !== 'all') {
            where.category = category;
        }
        if (status && status !== 'all') {
            where.status = status;
        }
        if (condition && condition !== 'all') {
            where.condition = condition;
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
            prisma_1.default.asset.findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: assetInclude,
            }),
            prisma_1.default.asset.count({ where }),
        ]);
        return { assets, total };
    }
    async findById(id) {
        return prisma_1.default.asset.findUnique({
            where: { id },
            include: assetInclude,
        });
    }
    async findByAssetCode(assetCode) {
        return prisma_1.default.asset.findUnique({ where: { assetCode } });
    }
    async findBySerialNumber(serialNumber) {
        return prisma_1.default.asset.findUnique({ where: { serialNumber } });
    }
    async create(data) {
        return prisma_1.default.asset.create({
            data: {
                assetCode: data.assetCode,
                name: data.name,
                category: data.category,
                brand: data.brand ?? null,
                model: data.model ?? null,
                serialNumber: data.serialNumber,
                status: data.status ?? 'AVAILABLE',
                condition: data.condition ?? 'GOOD',
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
    async update(id, data) {
        return prisma_1.default.asset.update({
            where: { id },
            data: {
                ...(data.assetCode !== undefined && { assetCode: data.assetCode }),
                ...(data.name !== undefined && { name: data.name }),
                ...(data.category !== undefined && { category: data.category }),
                ...(data.brand !== undefined && { brand: data.brand }),
                ...(data.model !== undefined && { model: data.model }),
                ...(data.serialNumber !== undefined && { serialNumber: data.serialNumber }),
                ...(data.status !== undefined && { status: data.status }),
                ...(data.condition !== undefined && { condition: data.condition }),
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
    async updateStatus(id, status) {
        return prisma_1.default.asset.update({
            where: { id },
            data: { status },
            include: assetInclude,
        });
    }
}
exports.AssetRepository = AssetRepository;
exports.assetRepository = new AssetRepository();
//# sourceMappingURL=asset.repository.js.map