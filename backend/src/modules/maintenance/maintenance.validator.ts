import { z } from 'zod';

export const issueCategoryEnum = z.enum([
  'HARDWARE',
  'SOFTWARE',
  'PRINTER',
  'NETWORK',
  'POWER_UPS',
  'OTHER',
]);

export const maintenancePriorityEnum = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
]);

export const maintenanceStatusEnum = z.enum([
  'OPEN',
  'IN_PROGRESS',
  'TESTING',
  'COMPLETED',
  'ON_HOLD',
  'CANCELLED',
]);

export const createMaintenanceSchema = z.object({
  assetId: z.string().uuid('Invalid asset ID'),
  category: issueCategoryEnum,
  priority: maintenancePriorityEnum.default('MEDIUM'),
  description: z.string().trim().min(3, 'Description must be at least 3 characters'),
  reportedBy: z.string().trim().min(1, 'Reported by employee is required'),
  assignedTechnician: z.string().trim().min(1, 'Assigned technician is required'),
  cost: z.coerce.number().min(0).optional().nullable(),
  startDate: z.string().optional().nullable(),
  status: maintenanceStatusEnum.optional().default('OPEN'),
  resolutionNotes: z.string().trim().optional().nullable(),
});

export const updateMaintenanceSchema = z.object({
  assetId: z.string().uuid('Invalid asset ID').optional(),
  category: issueCategoryEnum.optional(),
  priority: maintenancePriorityEnum.optional(),
  description: z.string().trim().min(3).optional(),
  reportedBy: z.string().trim().optional(),
  assignedTechnician: z.string().trim().optional(),
  cost: z.coerce.number().min(0).optional().nullable(),
  startDate: z.string().optional().nullable(),
  completedDate: z.string().optional().nullable(),
  status: maintenanceStatusEnum.optional(),
  resolutionNotes: z.string().trim().optional().nullable(),
});

export const updateMaintenanceStatusSchema = z.object({
  status: maintenanceStatusEnum,
  resolutionNotes: z.string().trim().optional().nullable(),
});

export const maintenanceQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  category: z.string().optional(),
  technician: z.string().optional(),
  assetId: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type IssueCategoryDTO = z.infer<typeof issueCategoryEnum>;
export type MaintenancePriorityDTO = z.infer<typeof maintenancePriorityEnum>;
export type MaintenanceStatusDTO = z.infer<typeof maintenanceStatusEnum>;
export type CreateMaintenanceDTO = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceDTO = z.infer<typeof updateMaintenanceSchema>;
export type UpdateMaintenanceStatusDTO = z.infer<typeof updateMaintenanceStatusSchema>;
export type MaintenanceQueryDTO = z.infer<typeof maintenanceQuerySchema>;
