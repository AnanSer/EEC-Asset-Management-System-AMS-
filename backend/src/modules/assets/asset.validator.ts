import { z } from 'zod';

export const assetCategoryEnum = z.enum([
  'LAPTOP', 'DESKTOP', 'PRINTER', 'SCANNER', 'ROUTER',
  'SWITCH', 'PROJECTOR', 'MONITOR', 'SERVER', 'UPS', 'OTHER',
]);

export const assetStatusEnum = z.enum([
  'AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'TESTING', 'RETIRED', 'DISPOSED',
]);

export const assetConditionEnum = z.enum([
  'EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_REPAIR', 'DAMAGED', 'RETIRED',
]);

// Statuses controlled exclusively by workflow (assignment, maintenance, testing)
export const WORKFLOW_CONTROLLED_STATUSES = ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'TESTING'] as const;

export const createAssetSchema = z.object({
  assetCode: z
    .string()
    .trim()
    .min(3, 'Asset code must be at least 3 characters')
    .max(50, 'Asset code cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9_-]+$/, 'Asset code can only contain letters, numbers, hyphens, and underscores')
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .trim()
    .min(2, 'Asset name must be at least 2 characters')
    .max(150, 'Asset name cannot exceed 150 characters'),
  category: assetCategoryEnum,
  brand: z.string().trim().max(100).optional().nullable(),
  model: z.string().trim().max(100).optional().nullable(),
  serialNumber: z
    .string()
    .trim()
    .min(2, 'Serial number must be at least 2 characters')
    .max(100, 'Serial number cannot exceed 100 characters'),
  // status is intentionally omitted — always defaults to AVAILABLE on create
  condition: assetConditionEnum.default('GOOD'),
  departmentId: z.string().uuid('Invalid department ID').optional().nullable(),
  location: z.string().trim().max(150).optional().nullable(),
  purchaseDate: z.string().optional().nullable(),
  purchasePrice: z.coerce.number().positive().optional().nullable(),
  warrantyExpiry: z.string().optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const updateAssetSchema = z.object({
  assetCode: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .regex(/^[A-Za-z0-9_-]+$/)
    .transform((val) => val.toUpperCase())
    .optional(),
  name: z.string().trim().min(2).max(150).optional(),
  category: assetCategoryEnum.optional(),
  brand: z.string().trim().max(100).optional().nullable(),
  model: z.string().trim().max(100).optional().nullable(),
  serialNumber: z.string().trim().min(2).max(100).optional(),
  // Only RETIRED and DISPOSED are manually settable via PUT
  status: z.enum(['RETIRED', 'DISPOSED']).optional(),
  condition: assetConditionEnum.optional(),
  departmentId: z.string().uuid('Invalid department ID').optional().nullable(),
  location: z.string().trim().max(150).optional().nullable(),
  purchaseDate: z.string().optional().nullable(),
  purchasePrice: z.coerce.number().positive().optional().nullable(),
  warrantyExpiry: z.string().optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});

// PATCH /api/assets/:id/status — only RETIRED and DISPOSED are manually settable
export const updateAssetStatusSchema = z.object({
  status: z.enum(['RETIRED', 'DISPOSED']),
});

export const assetQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  condition: z.string().optional(),
  departmentId: z.string().optional(),
  personal: z.enum(['true', 'false']).or(z.boolean()).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type CreateAssetDTO = z.infer<typeof createAssetSchema>;
export type UpdateAssetDTO = z.infer<typeof updateAssetSchema>;
export type AssetQueryDTO = z.infer<typeof assetQuerySchema>;
