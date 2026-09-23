"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetService = exports.AssetService = exports.AppError = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const asset_repository_1 = require("./asset.repository");
const asset_validator_1 = require("./asset.validator");
class AppError extends Error {
    constructor(message, statusCode = 400, errors) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
exports.AppError = AppError;
class AssetService {
    constructor(repo = asset_repository_1.assetRepository) {
        this.repo = repo;
    }
    formatAsset(asset) {
        if (!asset)
            return null;
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
            currentAssignment: asset.assignments?.[0]
                ? {
                    id: asset.assignments[0].id,
                    employeeId: asset.assignments[0].employee?.id,
                    employeeBadgeId: asset.assignments[0].employee?.employeeId,
                    employeeName: `${asset.assignments[0].employee?.firstName} ${asset.assignments[0].employee?.lastName}`.trim(),
                    departmentName: asset.assignments[0].employee?.department?.name || null,
                    assignedDate: asset.assignments[0].assignedDate,
                    remarks: asset.assignments[0].notes,
                }
                : null,
            createdAt: asset.createdAt,
            updatedAt: asset.updatedAt,
            _count: asset._count,
        };
    }
    async getAssets(query) {
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
    async getAssetById(id) {
        const asset = await this.repo.findById(id);
        if (!asset) {
            throw new AppError(`Asset with ID '${id}' not found`, 404);
        }
        return this.formatAsset(asset);
    }
    async createAsset(data) {
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
            const dept = await prisma_1.default.department.findUnique({ where: { id: data.departmentId } });
            if (!dept) {
                throw new AppError(`Department with ID '${data.departmentId}' not found`, 404);
            }
        }
        // Always create assets as AVAILABLE — status is workflow-controlled
        const created = await this.repo.create({ ...data, status: 'AVAILABLE' });
        return this.formatAsset(created);
    }
    async updateAsset(id, data) {
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
            const dept = await prisma_1.default.department.findUnique({ where: { id: data.departmentId } });
            if (!dept) {
                throw new AppError(`Department with ID '${data.departmentId}' not found`, 404);
            }
        }
        // Guard: block setting workflow-controlled statuses through PUT
        if (data.status && asset_validator_1.WORKFLOW_CONTROLLED_STATUSES.includes(data.status)) {
            throw new AppError(`Status '${data.status}' is controlled by the workflow and cannot be set manually. Use asset assignment or maintenance modules.`, 422);
        }
        const updated = await this.repo.update(id, data);
        return this.formatAsset(updated);
    }
    async updateStatus(id, status) {
        const current = await this.repo.findById(id);
        if (!current) {
            throw new AppError(`Asset with ID '${id}' not found`, 404);
        }
        // Only RETIRED and DISPOSED are manually settable
        if (asset_validator_1.WORKFLOW_CONTROLLED_STATUSES.includes(status)) {
            throw new AppError(`Status '${status}' is controlled by the workflow and cannot be set manually.`, 422);
        }
        const updated = await this.repo.updateStatus(id, status);
        return this.formatAsset(updated);
    }
}
exports.AssetService = AssetService;
exports.assetService = new AssetService();
//# sourceMappingURL=asset.service.js.map