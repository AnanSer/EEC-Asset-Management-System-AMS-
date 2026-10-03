import { z } from 'zod';
import { AssetCategory, RequestStatus } from '@prisma/client';

export const createRequestSchema = z.object({
  category: z.nativeEnum(AssetCategory),
  description: z.string().min(3, 'Description / reason must be at least 3 characters'),
  notes: z.string().optional(),
});

export const approveRequestSchema = z.object({
  approvalRemarks: z.string().optional(),
});

export const rejectRequestSchema = z.object({
  rejectionReason: z.string().min(2, 'Rejection reason is required'),
});

export const fulfillRequestSchema = z.object({
  assetId: z.string().uuid('Valid asset UUID is required'),
  handoverNotes: z.string().optional(),
  conditionOnAssign: z
    .enum(['EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_REPAIR', 'DAMAGED', 'RETIRED'])
    .optional(),
});

export const requestQuerySchema = z.object({
  status: z.nativeEnum(RequestStatus).optional(),
  category: z.nativeEnum(AssetCategory).optional(),
  departmentId: z.string().optional(),
  requesterId: z.string().optional(),
  search: z.string().optional(),
  personal: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type CreateRequestDTO = z.infer<typeof createRequestSchema>;
export type ApproveRequestDTO = z.infer<typeof approveRequestSchema>;
export type RejectRequestDTO = z.infer<typeof rejectRequestSchema>;
export type FulfillRequestDTO = z.infer<typeof fulfillRequestSchema>;
export type RequestQueryDTO = z.infer<typeof requestQuerySchema>;
