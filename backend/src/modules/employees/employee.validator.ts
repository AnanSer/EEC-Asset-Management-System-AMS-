import { z } from 'zod';

export const userRoleEnum = z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'VIEWER']);

export const createEmployeeSchema = z.object({
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
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(150, 'Email cannot exceed 150 characters')
    .transform((val) => val.toLowerCase()),
  phone: z
    .string()
    .trim()
    .max(30, 'Phone number cannot exceed 30 characters')
    .optional()
    .nullable(),
  position: z
    .string()
    .trim()
    .min(2, 'Position must be at least 2 characters')
    .max(100, 'Position cannot exceed 100 characters'),
  departmentId: z
    .string()
    .uuid('Invalid department ID'),
  role: userRoleEnum.default('EMPLOYEE'),
  officeLocation: z
    .string()
    .trim()
    .max(100)
    .optional()
    .nullable(),
});

export const updateEmployeeSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100)
    .optional(),
  employeeId: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[A-Za-z0-9_-]+$/)
    .transform((val) => val.toUpperCase())
    .optional(),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(150)
    .transform((val) => val.toLowerCase())
    .optional(),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .nullable(),
  position: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .optional(),
  departmentId: z
    .string()
    .uuid('Invalid department ID')
    .optional(),
  role: userRoleEnum.optional(),
  officeLocation: z
    .string()
    .trim()
    .max(100)
    .optional()
    .nullable(),
});

export const updateEmployeeStatusSchema = z.object({
  isActive: z.boolean(),
});

export const employeeQuerySchema = z.object({
  search: z.string().optional(),
  departmentId: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).optional().default('all'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type CreateEmployeeDTO = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeDTO = z.infer<typeof updateEmployeeSchema>;
export type EmployeeQueryDTO = z.infer<typeof employeeQuerySchema>;
