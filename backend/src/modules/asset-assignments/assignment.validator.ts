import { z } from 'zod';

export const assignAssetSchema = z.object({
  assetId: z.string().uuid('Invalid asset ID'),
  employeeId: z.string().uuid('Invalid employee ID'),
  assignedDate: z.string().optional().nullable(),
  conditionOnAssign: z.string().trim().max(100).optional().nullable(),
  remarks: z.string().trim().max(1000).optional().nullable(),
});

export const transferAssetSchema = z.object({
  newEmployeeId: z.string().uuid('Invalid new employee ID'),
  transferDate: z.string().optional().nullable(),
  conditionOnTransfer: z.string().trim().max(100).optional().nullable(),
  remarks: z.string().trim().max(1000).optional().nullable(),
});

export const returnAssetSchema = z.object({
  returnDate: z.string().optional().nullable(),
  conditionOnReturn: z.string().trim().max(100).optional().nullable(),
  remarks: z.string().trim().max(1000).optional().nullable(),
});

export const assignmentQuerySchema = z.object({
  search: z.string().optional(),
  departmentId: z.string().optional(),
  employeeId: z.string().optional(),
  assetId: z.string().optional(),
  isCurrent: z.enum(['true', 'false', 'all']).optional().default('all'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type AssignAssetDTO = z.infer<typeof assignAssetSchema>;
export type TransferAssetDTO = z.infer<typeof transferAssetSchema>;
export type ReturnAssetDTO = z.infer<typeof returnAssetSchema>;
export type AssignmentQueryDTO = z.infer<typeof assignmentQuerySchema>;
