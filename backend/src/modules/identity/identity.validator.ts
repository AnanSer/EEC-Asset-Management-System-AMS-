// EEC EAMS – Identity Module Validator & DTOs (Phase 9A.2)
// Validation schemas and types for account lifecycle and authentication-related business logic.

import { z } from 'zod';
import { ROLE_LIST } from '../../constants';

// Roles matching UserRole enum in schema.prisma
export const userRoleEnum = z.enum(ROLE_LIST);

// Account statuses matching AccountStatus enum in schema.prisma
export const accountStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']);

/**
 * Registration Request Schema
 * Used when a new employee or user submits a registration request.
 */
export const registrationSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(150, 'Email cannot exceed 150 characters')
    .transform((val) => val.toLowerCase()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  employeeId: z
    .string()
    .trim()
    .min(3, 'Employee ID must be at least 3 characters')
    .max(30, 'Employee ID cannot exceed 30 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Employee ID can only contain alphanumeric characters, hyphens, and underscores')
    .transform((val) => val.toUpperCase()),
  departmentId: z
    .string()
    .uuid('Invalid department ID'),
  position: z
    .string()
    .trim()
    .min(2, 'Position must be at least 2 characters')
    .max(100, 'Position cannot exceed 100 characters'),
  phone: z
    .string()
    .trim()
    .max(30, 'Phone number cannot exceed 30 characters')
    .optional()
    .nullable(),
  officeLocation: z
    .string()
    .trim()
    .max(100)
    .optional()
    .nullable(),
  requestedRole: userRoleEnum.optional().default('EMPLOYEE'),
});

/**
 * Approval Request Schema
 * Used when an administrator approves a pending account request.
 */
export const approvalSchema = z.object({
  role: userRoleEnum.optional().default('EMPLOYEE'),
  notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
});

/**
 * Rejection Request Schema
 * Used when an administrator rejects a pending account request.
 */
export const rejectionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, 'Rejection reason must be at least 3 characters')
    .max(500, 'Rejection reason cannot exceed 500 characters'),
});

/**
 * Account Suspension Schema (for future use)
 */
export const suspensionSchema = z.object({
  isSuspended: z.boolean(),
  reason: z.string().trim().max(500).optional().nullable(),
});

/**
 * Query schema for listing pending account requests
 */
export const pendingUserQuerySchema = z.object({
  search: z.string().optional(),
  departmentId: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

// TypeScript DTO Types
export type RegistrationRequest = z.infer<typeof registrationSchema>;
export type RegistrationRequestDTO = RegistrationRequest;

export type ApprovalRequest = z.infer<typeof approvalSchema>;
export type ApprovalRequestDTO = ApprovalRequest;

export type RejectionRequest = z.infer<typeof rejectionSchema>;
export type RejectionRequestDTO = RejectionRequest;

export type SuspensionRequest = z.infer<typeof suspensionSchema>;
export type SuspensionRequestDTO = SuspensionRequest;

export type PendingUserQueryDTO = z.infer<typeof pendingUserQuerySchema>;

/**
 * DTO for Pending User Response item
 */
export interface PendingUserResponse {
  id: string;
  email: string;
  role: z.infer<typeof userRoleEnum>;
  status: z.infer<typeof accountStatusEnum>;
  isEmailVerified: boolean;
  createdAt: Date;
  employeeProfile?: {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phone: string | null;
    jobTitle: string;
    departmentId: string;
    departmentName?: string;
    officeLocation: string | null;
  } | null;
}
