"use strict";
// EEC EAMS – Identity Module Validator & DTOs (Phase 9A.2)
// Validation schemas and types for account lifecycle and authentication-related business logic.
Object.defineProperty(exports, "__esModule", { value: true });
exports.pendingUserQuerySchema = exports.suspensionSchema = exports.rejectionSchema = exports.approvalSchema = exports.registrationSchema = exports.accountStatusEnum = exports.userRoleEnum = void 0;
const zod_1 = require("zod");
const constants_1 = require("../../constants");
// Roles matching UserRole enum in schema.prisma
exports.userRoleEnum = zod_1.z.enum(constants_1.ROLE_LIST);
// Account statuses matching AccountStatus enum in schema.prisma
exports.accountStatusEnum = zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']);
/**
 * Registration Request Schema
 * Used when a new employee or user submits a registration request.
 */
exports.registrationSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .trim()
        .email('Invalid email address')
        .max(150, 'Email cannot exceed 150 characters')
        .transform((val) => val.toLowerCase()),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password cannot exceed 100 characters'),
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
    departmentId: zod_1.z
        .string()
        .uuid('Invalid department ID'),
    position: zod_1.z
        .string()
        .trim()
        .min(2, 'Position must be at least 2 characters')
        .max(100, 'Position cannot exceed 100 characters'),
    phone: zod_1.z
        .string()
        .trim()
        .max(30, 'Phone number cannot exceed 30 characters')
        .optional()
        .nullable(),
    officeLocation: zod_1.z
        .string()
        .trim()
        .max(100)
        .optional()
        .nullable(),
    requestedRole: exports.userRoleEnum.optional().default('EMPLOYEE'),
});
/**
 * Approval Request Schema
 * Used when an administrator approves a pending account request.
 */
exports.approvalSchema = zod_1.z.object({
    role: exports.userRoleEnum.optional().default('EMPLOYEE'),
    notes: zod_1.z.string().trim().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
});
/**
 * Rejection Request Schema
 * Used when an administrator rejects a pending account request.
 */
exports.rejectionSchema = zod_1.z.object({
    reason: zod_1.z
        .string()
        .trim()
        .min(3, 'Rejection reason must be at least 3 characters')
        .max(500, 'Rejection reason cannot exceed 500 characters'),
});
/**
 * Account Suspension Schema (for future use)
 */
exports.suspensionSchema = zod_1.z.object({
    isSuspended: zod_1.z.boolean(),
    reason: zod_1.z.string().trim().max(500).optional().nullable(),
});
/**
 * Query schema for listing pending account requests
 */
exports.pendingUserQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    departmentId: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(10),
});
//# sourceMappingURL=identity.validator.js.map