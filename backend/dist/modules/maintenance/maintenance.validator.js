"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceQuerySchema = exports.updateMaintenanceStatusSchema = exports.updateMaintenanceSchema = exports.createMaintenanceSchema = exports.maintenanceStatusEnum = exports.maintenancePriorityEnum = exports.issueCategoryEnum = void 0;
const zod_1 = require("zod");
exports.issueCategoryEnum = zod_1.z.enum([
    'HARDWARE',
    'SOFTWARE',
    'PRINTER',
    'NETWORK',
    'POWER_UPS',
    'OTHER',
]);
exports.maintenancePriorityEnum = zod_1.z.enum([
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL',
]);
exports.maintenanceStatusEnum = zod_1.z.enum([
    'OPEN',
    'IN_PROGRESS',
    'TESTING',
    'COMPLETED',
    'ON_HOLD',
    'CANCELLED',
]);
exports.createMaintenanceSchema = zod_1.z.object({
    assetId: zod_1.z.string().uuid('Invalid asset ID'),
    category: exports.issueCategoryEnum,
    priority: exports.maintenancePriorityEnum.default('MEDIUM'),
    description: zod_1.z.string().trim().min(3, 'Description must be at least 3 characters'),
    reportedBy: zod_1.z.string().trim().min(1, 'Reported by employee is required'),
    assignedTechnician: zod_1.z.string().trim().min(1, 'Assigned technician is required'),
    cost: zod_1.z.coerce.number().min(0).optional().nullable(),
    startDate: zod_1.z.string().optional().nullable(),
    status: exports.maintenanceStatusEnum.optional().default('OPEN'),
    resolutionNotes: zod_1.z.string().trim().optional().nullable(),
});
exports.updateMaintenanceSchema = zod_1.z.object({
    assetId: zod_1.z.string().uuid('Invalid asset ID').optional(),
    category: exports.issueCategoryEnum.optional(),
    priority: exports.maintenancePriorityEnum.optional(),
    description: zod_1.z.string().trim().min(3).optional(),
    reportedBy: zod_1.z.string().trim().optional(),
    assignedTechnician: zod_1.z.string().trim().optional(),
    cost: zod_1.z.coerce.number().min(0).optional().nullable(),
    startDate: zod_1.z.string().optional().nullable(),
    completedDate: zod_1.z.string().optional().nullable(),
    status: exports.maintenanceStatusEnum.optional(),
    resolutionNotes: zod_1.z.string().trim().optional().nullable(),
});
exports.updateMaintenanceStatusSchema = zod_1.z.object({
    status: exports.maintenanceStatusEnum,
    resolutionNotes: zod_1.z.string().trim().optional().nullable(),
});
exports.maintenanceQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    priority: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    technician: zod_1.z.string().optional(),
    assetId: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(10),
});
//# sourceMappingURL=maintenance.validator.js.map