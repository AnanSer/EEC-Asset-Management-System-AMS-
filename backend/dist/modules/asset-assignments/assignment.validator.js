"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignmentQuerySchema = exports.returnAssetSchema = exports.transferAssetSchema = exports.assignAssetSchema = void 0;
const zod_1 = require("zod");
exports.assignAssetSchema = zod_1.z.object({
    assetId: zod_1.z.string().uuid('Invalid asset ID'),
    employeeId: zod_1.z.string().uuid('Invalid employee ID'),
    assignedDate: zod_1.z.string().optional().nullable(),
    conditionOnAssign: zod_1.z.string().trim().max(100).optional().nullable(),
    remarks: zod_1.z.string().trim().max(1000).optional().nullable(),
});
exports.transferAssetSchema = zod_1.z.object({
    newEmployeeId: zod_1.z.string().uuid('Invalid new employee ID'),
    transferDate: zod_1.z.string().optional().nullable(),
    conditionOnTransfer: zod_1.z.string().trim().max(100).optional().nullable(),
    remarks: zod_1.z.string().trim().max(1000).optional().nullable(),
});
exports.returnAssetSchema = zod_1.z.object({
    returnDate: zod_1.z.string().optional().nullable(),
    conditionOnReturn: zod_1.z.string().trim().max(100).optional().nullable(),
    remarks: zod_1.z.string().trim().max(1000).optional().nullable(),
});
exports.assignmentQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().optional(),
    employeeId: zod_1.z.string().optional(),
    assetId: zod_1.z.string().optional(),
    isCurrent: zod_1.z.enum(['true', 'false', 'all']).optional().default('all'),
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(10),
});
//# sourceMappingURL=assignment.validator.js.map