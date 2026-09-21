import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2, 'Department name must be at least 2 characters').max(150),
  code: z
    .string()
    .trim()
    .min(2, 'Department code must be at least 2 characters')
    .max(20)
    .regex(/^[A-Za-z0-9_-]+$/, 'Code can only contain letters, numbers, hyphens, and underscores')
    .transform((val) => val.toUpperCase()),
  description: z.string().trim().max(500).optional().nullable(),
  location: z.string().trim().max(200).optional().nullable(),
  officeLocation: z.string().trim().max(100).optional().nullable(),
  building: z.string().trim().max(100).optional().nullable(),
  floor: z.string().trim().max(50).optional().nullable(),
  headOfDepartment: z.string().trim().max(100).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const updateStatusSchema = z.object({
  isActive: z.boolean(),
});

export const departmentQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'inactive']).optional().default('all'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type CreateDepartmentDTO = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentDTO = z.infer<typeof updateDepartmentSchema>;
export type DepartmentQueryDTO = z.infer<typeof departmentQuerySchema>;
