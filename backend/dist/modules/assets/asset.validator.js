"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetQuerySchema = exports.updateAssetStatusSchema = exports.updateAssetSchema = exports.createAssetSchema = exports.WORKFLOW_CONTROLLED_STATUSES = exports.assetConditionEnum = exports.assetStatusEnum = exports.assetCategoryEnum = void 0;
const zod_1 = require("zod");
exports.assetCategoryEnum = zod_1.z.enum([
    'LAPTOP', 'DESKTOP', 'PRINTER', 'SCANNER', 'ROUTER',
    'SWITCH', 'PROJECTOR', 'MONITOR', 'SERVER', 'UPS', 'OTHER',
]);
exports.assetStatusEnum = zod_1.z.enum([
    'AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'TESTING', 'RETIRED', 'DISPOSED',
]);
exports.assetConditionEnum = zod_1.z.enum([
    'EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_REPAIR', 'DAMAGED', 'RETIRED',
]);
// Statuses controlled exclusively by workflow (assignment, maintenance, testing)
exports.WORKFLOW_CONTROLLED_STATUSES = ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'TESTING'];
exports.createAssetSchema = zod_1.z.object({
    assetCode: zod_1.z
        .string()
        .trim()
        .min(3, 'Asset code must be at least 3 characters')
        .max(50, 'Asset code cannot exceed 50 characters')
        .regex(/^[A-Za-z0-9_-]+$/, 'Asset code can only contain letters, numbers, hyphens, and underscores')
        .transform((val) => val.toUpperCase()),
    name: zod_1.z
        .string()
        .trim()
        .min(2, 'Asset name must be at least 2 characters')
        .max(150, 'Asset name cannot exceed 150 characters'),
    category: exports.assetCategoryEnum,
    brand: zod_1.z.string().trim().max(100).optional().nullable(),
    model: zod_1.z.string().trim().max(100).optional().nullable(),
    serialNumber: zod_1.z
        .string()
        .trim()
        .min(2, 'Serial number must be at least 2 characters')
        .max(100, 'Serial number cannot exceed 100 characters'),
    // status is intentionally omitted — always defaults to AVAILABLE on create
    condition: exports.assetConditionEnum.default('GOOD'),
    departmentId: zod_1.z.string().uuid('Invalid department ID').optional().nullable(),
    location: zod_1.z.string().trim().max(150).optional().nullable(),
    purchaseDate: zod_1.z.string().optional().nullable(),
    purchasePrice: zod_1.z.coerce.number().positive().optional().nullable(),
    warrantyExpiry: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().trim().max(1000).optional().nullable(),
});
exports.updateAssetSchema = zod_1.z.object({
    assetCode: zod_1.z
        .string()
        .trim()
        .min(3)
        .max(50)
        .regex(/^[A-Za-z0-9_-]+$/)
        .transform((val) => val.toUpperCase())
        .optional(),
    name: zod_1.z.string().trim().min(2).max(150).optional(),
    category: exports.assetCategoryEnum.optional(),
    brand: zod_1.z.string().trim().max(100).optional().nullable(),
    model: zod_1.z.string().trim().max(100).optional().nullable(),
    serialNumber: zod_1.z.string().trim().min(2).max(100).optional(),
    // Only RETIRED and DISPOSED are manually settable via PUT
    status: zod_1.z.enum(['RETIRED', 'DISPOSED']).optional(),
    condition: exports.assetConditionEnum.optional(),
    departmentId: zod_1.z.string().uuid('Invalid department ID').optional().nullable(),
    location: zod_1.z.string().trim().max(150).optional().nullable(),
    purchaseDate: zod_1.z.string().optional().nullable(),
    purchasePrice: zod_1.z.coerce.number().positive().optional().nullable(),
    warrantyExpiry: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().trim().max(1000).optional().nullable(),
});
// PATCH /api/assets/:id/status — only RETIRED and DISPOSED are manually settable
exports.updateAssetStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['RETIRED', 'DISPOSED']),
});
exports.assetQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    condition: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().optional(),
    personal: zod_1.z.enum(['true', 'false']).or(zod_1.z.boolean()).optional(),
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(10),
});
//# sourceMappingURL=asset.validator.js.map