import { z } from 'zod';
export declare const createReturnRequestSchema: z.ZodObject<{
    assetId: z.ZodString;
    reason: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const receiveReturnSchema: z.ZodObject<{
    conditionOnReturn: z.ZodOptional<z.ZodEnum<{
        EXCELLENT: 'EXCELLENT';
        GOOD: 'GOOD';
        FAIR: 'FAIR';
        NEEDS_REPAIR: 'NEEDS_REPAIR';
        DAMAGED: 'DAMAGED';
        RETIRED: 'RETIRED';
    }>>;
    returnLocation: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const walkInReturnSchema: z.ZodObject<{
    assetId: z.ZodString;
    conditionOnReturn: z.ZodEnum<{
        EXCELLENT: 'EXCELLENT';
        GOOD: 'GOOD';
        FAIR: 'FAIR';
        NEEDS_REPAIR: 'NEEDS_REPAIR';
        DAMAGED: 'DAMAGED';
        RETIRED: 'RETIRED';
    }>;
    returnLocation: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const returnQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        PENDING: 'PENDING';
        RECEIVED: 'RECEIVED';
        CANCELLED: 'CANCELLED';
    }>>;
    departmentId: z.ZodOptional<z.ZodString>;
    requesterId: z.ZodOptional<z.ZodString>;
    assetId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    personal: z.ZodOptional<z.ZodEnum<{
        false: "false";
        true: "true";
    }>>;
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type CreateReturnRequestDTO = z.infer<typeof createReturnRequestSchema>;
export type ReceiveReturnDTO = z.infer<typeof receiveReturnSchema>;
export type WalkInReturnDTO = z.infer<typeof walkInReturnSchema>;
export type ReturnQueryDTO = z.infer<typeof returnQuerySchema>;
//# sourceMappingURL=return.validator.d.ts.map