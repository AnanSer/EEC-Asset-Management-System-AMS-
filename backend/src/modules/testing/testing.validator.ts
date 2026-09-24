import { z } from 'zod';

export const inspectionResultEnum = z.enum(['PASS', 'FAIL']);

export const createInspectionSchema = z.object({
  ticketId: z.string().uuid('Invalid ticket ID'),
  testedBy: z.string().trim().min(1, 'Technician name is required'),
  testDate: z.string().optional().nullable(),
  result: inspectionResultEnum,
  testType: z.string().trim().optional().default('QUALITY_AND_FUNCTIONALITY'),
  findings: z.string().trim().optional().nullable(),
  recommendations: z.string().trim().optional().nullable(),
  autoComplete: z.boolean().optional().default(true),
});

export const updateInspectionSchema = z.object({
  testedBy: z.string().trim().optional(),
  testDate: z.string().optional().nullable(),
  result: inspectionResultEnum.optional(),
  testType: z.string().trim().optional(),
  findings: z.string().trim().optional().nullable(),
  recommendations: z.string().trim().optional().nullable(),
});

export type CreateInspectionDTO = z.infer<typeof createInspectionSchema>;
export type UpdateInspectionDTO = z.infer<typeof updateInspectionSchema>;
