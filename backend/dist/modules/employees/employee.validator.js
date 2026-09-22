"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeQuerySchema = exports.updateEmployeeStatusSchema = exports.updateEmployeeSchema = exports.createEmployeeSchema = exports.userRoleEnum = void 0;
const zod_1 = require("zod");
exports.userRoleEnum = zod_1.z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'VIEWER']);
exports.createEmployeeSchema = zod_1.z.object({
    fullName: zod_1.z
        .string()
        .trim()
        .min(2, 'Full name must be at least 2 characters')
        .max(100, 'Full name cannot exceed 100 characters'),
    employeeId: zod_1.z
        .string()
        .trim()
        .min(3, 'Employee ID must be at least 3 characters')
        .max(30, 'Employee ID cannot exceed 30 characters')
        .regex(/^[A-Za-z0-9_-]+$/, 'Employee ID can only contain alphanumeric characters, hyphens, and underscores')
        .transform((val) => val.toUpperCase()),
    email: zod_1.z
        .string()
        .trim()
        .email('Invalid email address')
        .max(150, 'Email cannot exceed 150 characters')
        .transform((val) => val.toLowerCase()),
    phone: zod_1.z
        .string()
        .trim()
        .max(30, 'Phone number cannot exceed 30 characters')
        .optional()
        .nullable(),
    position: zod_1.z
        .string()
        .trim()
        .min(2, 'Position must be at least 2 characters')
        .max(100, 'Position cannot exceed 100 characters'),
    departmentId: zod_1.z
        .string()
        .uuid('Invalid department ID'),
    role: exports.userRoleEnum.default('EMPLOYEE'),
    officeLocation: zod_1.z
        .string()
        .trim()
        .max(100)
        .optional()
        .nullable(),
});
exports.updateEmployeeSchema = zod_1.z.object({
    fullName: zod_1.z
        .string()
        .trim()
        .min(2, 'Full name must be at least 2 characters')
        .max(100)
        .optional(),
    employeeId: zod_1.z
        .string()
        .trim()
        .min(3)
        .max(30)
        .regex(/^[A-Za-z0-9_-]+$/)
        .transform((val) => val.toUpperCase())
        .optional(),
    email: zod_1.z
        .string()
        .trim()
        .email('Invalid email address')
        .max(150)
        .transform((val) => val.toLowerCase())
        .optional(),
    phone: zod_1.z
        .string()
        .trim()
        .max(30)
        .optional()
        .nullable(),
    position: zod_1.z
        .string()
        .trim()
        .min(2)
        .max(100)
        .optional(),
    departmentId: zod_1.z
        .string()
        .uuid('Invalid department ID')
        .optional(),
    role: exports.userRoleEnum.optional(),
    officeLocation: zod_1.z
        .string()
        .trim()
        .max(100)
        .optional()
        .nullable(),
});
exports.updateEmployeeStatusSchema = zod_1.z.object({
    isActive: zod_1.z.boolean(),
});
exports.employeeQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().optional(),
    role: zod_1.z.string().optional(),
    status: zod_1.z.enum(['all', 'active', 'inactive']).optional().default('all'),
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(10),
});
//# sourceMappingURL=employee.validator.js.map