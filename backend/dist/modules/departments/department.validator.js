"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentQuerySchema = exports.updateStatusSchema = exports.updateDepartmentSchema = exports.createDepartmentSchema = void 0;
const zod_1 = require("zod");
exports.createDepartmentSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, 'Department name must be at least 2 characters').max(150),
    code: zod_1.z
        .string()
        .trim()
        .min(2, 'Department code must be at least 2 characters')
        .max(20)
        .regex(/^[A-Za-z0-9_-]+$/, 'Code can only contain letters, numbers, hyphens, and underscores')
        .transform((val) => val.toUpperCase()),
    description: zod_1.z.string().trim().max(500).optional().nullable(),
    location: zod_1.z.string().trim().max(200).optional().nullable(),
    officeLocation: zod_1.z.string().trim().max(100).optional().nullable(),
    building: zod_1.z.string().trim().max(100).optional().nullable(),
    floor: zod_1.z.string().trim().max(50).optional().nullable(),
    headOfDepartment: zod_1.z.string().trim().max(100).optional().nullable(),
    isActive: zod_1.z.boolean().optional().default(true),
});
exports.updateDepartmentSchema = exports.createDepartmentSchema.partial();
exports.updateStatusSchema = zod_1.z.object({
    isActive: zod_1.z.boolean(),
});
exports.departmentQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    status: zod_1.z.enum(['all', 'active', 'inactive']).optional().default('all'),
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(10),
});
//# sourceMappingURL=department.validator.js.map