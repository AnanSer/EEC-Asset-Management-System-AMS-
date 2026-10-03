"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnQuerySchema = exports.walkInReturnSchema = exports.receiveReturnSchema = exports.createReturnRequestSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createReturnRequestSchema = zod_1.z.object({
    assetId: zod_1.z.string().uuid('Invalid asset ID'),
    reason: zod_1.z.string().min(3, 'Return reason must be at least 3 characters').max(500, 'Return reason is too long'),
    notes: zod_1.z.string().max(500).optional(),
});
exports.receiveReturnSchema = zod_1.z.object({
    conditionOnReturn: zod_1.z.nativeEnum(client_1.AssetCondition).optional(),
    returnLocation: zod_1.z.string().min(2, 'Return location must be at least 2 characters').max(100, 'Return location is too long'),
    notes: zod_1.z.string().max(500).optional(),
});
exports.walkInReturnSchema = zod_1.z.object({
    assetId: zod_1.z.string().uuid('Invalid asset ID'),
    conditionOnReturn: zod_1.z.nativeEnum(client_1.AssetCondition),
    returnLocation: zod_1.z.string().min(2, 'Return location must be at least 2 characters').max(100, 'Return location is too long'),
    notes: zod_1.z.string().max(500).optional(),
});
exports.returnQuerySchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.ReturnRequestStatus).optional(),
    departmentId: zod_1.z.string().optional(),
    requesterId: zod_1.z.string().optional(),
    assetId: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    personal: zod_1.z.enum(['true', 'false']).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
});
//# sourceMappingURL=return.validator.js.map