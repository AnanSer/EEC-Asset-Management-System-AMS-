"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestQuerySchema = exports.fulfillRequestSchema = exports.rejectRequestSchema = exports.approveRequestSchema = exports.createRequestSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createRequestSchema = zod_1.z.object({
    category: zod_1.z.nativeEnum(client_1.AssetCategory),
    description: zod_1.z.string().min(3, 'Description / reason must be at least 3 characters'),
    notes: zod_1.z.string().optional(),
});
exports.approveRequestSchema = zod_1.z.object({
    approvalRemarks: zod_1.z.string().optional(),
});
exports.rejectRequestSchema = zod_1.z.object({
    rejectionReason: zod_1.z.string().min(2, 'Rejection reason is required'),
});
exports.fulfillRequestSchema = zod_1.z.object({
    assetId: zod_1.z.string().uuid('Valid asset UUID is required'),
    handoverNotes: zod_1.z.string().optional(),
    conditionOnAssign: zod_1.z
        .enum(['EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_REPAIR', 'DAMAGED', 'RETIRED'])
        .optional(),
});
exports.requestQuerySchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.RequestStatus).optional(),
    category: zod_1.z.nativeEnum(client_1.AssetCategory).optional(),
    departmentId: zod_1.z.string().optional(),
    requesterId: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    personal: zod_1.z.enum(['true', 'false']).optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(10),
});
//# sourceMappingURL=request.validator.js.map