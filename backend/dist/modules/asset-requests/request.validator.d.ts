import { z } from 'zod';
export declare const createRequestSchema: z.ZodObject<{
    category: z.ZodEnum<{
        LAPTOP: 'LAPTOP';
        DESKTOP: 'DESKTOP';
        PRINTER: 'PRINTER';
        SCANNER: 'SCANNER';
        ROUTER: 'ROUTER';
        SWITCH: 'SWITCH';
        PROJECTOR: 'PROJECTOR';
        MONITOR: 'MONITOR';
        SERVER: 'SERVER';
        UPS: 'UPS';
        OTHER: 'OTHER';
    }>;
    description: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const approveRequestSchema: z.ZodObject<{
    approvalRemarks: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const rejectRequestSchema: z.ZodObject<{
    rejectionReason: z.ZodString;
}, z.core.$strip>;
export declare const fulfillRequestSchema: z.ZodObject<{
    assetId: z.ZodString;
    handoverNotes: z.ZodOptional<z.ZodString>;
    conditionOnAssign: z.ZodOptional<z.ZodEnum<{
        DAMAGED: "DAMAGED";
        EXCELLENT: "EXCELLENT";
        FAIR: "FAIR";
        GOOD: "GOOD";
        NEEDS_REPAIR: "NEEDS_REPAIR";
        RETIRED: "RETIRED";
    }>>;
}, z.core.$strip>;
export declare const requestQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        PENDING: 'PENDING';
        APPROVED: 'APPROVED';
        REJECTED: 'REJECTED';
        FULFILLED: 'FULFILLED';
        CANCELLED: 'CANCELLED';
    }>>;
    category: z.ZodOptional<z.ZodEnum<{
        LAPTOP: 'LAPTOP';
        DESKTOP: 'DESKTOP';
        PRINTER: 'PRINTER';
        SCANNER: 'SCANNER';
        ROUTER: 'ROUTER';
        SWITCH: 'SWITCH';
        PROJECTOR: 'PROJECTOR';
        MONITOR: 'MONITOR';
        SERVER: 'SERVER';
        UPS: 'UPS';
        OTHER: 'OTHER';
    }>>;
    departmentId: z.ZodOptional<z.ZodString>;
    requesterId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    personal: z.ZodOptional<z.ZodEnum<{
        false: "false";
        true: "true";
    }>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type CreateRequestDTO = z.infer<typeof createRequestSchema>;
export type ApproveRequestDTO = z.infer<typeof approveRequestSchema>;
export type RejectRequestDTO = z.infer<typeof rejectRequestSchema>;
export type FulfillRequestDTO = z.infer<typeof fulfillRequestSchema>;
export type RequestQueryDTO = z.infer<typeof requestQuerySchema>;
//# sourceMappingURL=request.validator.d.ts.map