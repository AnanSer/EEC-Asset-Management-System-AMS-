import { z } from 'zod';
import { ReturnRequestStatus, AssetCondition } from '@prisma/client';

export const createReturnRequestSchema = z.object({
  assetId: z.string().uuid('Invalid asset ID'),
  reason: z.string().min(3, 'Return reason must be at least 3 characters').max(500, 'Return reason is too long'),
  notes: z.string().max(500).optional(),
});

export const receiveReturnSchema = z.object({
  conditionOnReturn: z.nativeEnum(AssetCondition).optional(),
  returnLocation: z.string().min(2, 'Return location must be at least 2 characters').max(100, 'Return location is too long'),
  notes: z.string().max(500).optional(),
});

export const walkInReturnSchema = z.object({
  assetId: z.string().uuid('Invalid asset ID'),
  conditionOnReturn: z.nativeEnum(AssetCondition),
  returnLocation: z.string().min(2, 'Return location must be at least 2 characters').max(100, 'Return location is too long'),
  notes: z.string().max(500).optional(),
});

export const returnQuerySchema = z.object({
  status: z.nativeEnum(ReturnRequestStatus).optional(),
  departmentId: z.string().optional(),
  requesterId: z.string().optional(),
  assetId: z.string().optional(),
  search: z.string().optional(),
  personal: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateReturnRequestDTO = z.infer<typeof createReturnRequestSchema>;
export type ReceiveReturnDTO = z.infer<typeof receiveReturnSchema>;
export type WalkInReturnDTO = z.infer<typeof walkInReturnSchema>;
export type ReturnQueryDTO = z.infer<typeof returnQuerySchema>;
