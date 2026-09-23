import { z } from 'zod';
export declare const assetCategoryEnum: z.ZodEnum<{
    DESKTOP: "DESKTOP";
    LAPTOP: "LAPTOP";
    MONITOR: "MONITOR";
    OTHER: "OTHER";
    PRINTER: "PRINTER";
    PROJECTOR: "PROJECTOR";
    ROUTER: "ROUTER";
    SCANNER: "SCANNER";
    SERVER: "SERVER";
    SWITCH: "SWITCH";
    UPS: "UPS";
}>;
export declare const assetStatusEnum: z.ZodEnum<{
    ASSIGNED: "ASSIGNED";
    AVAILABLE: "AVAILABLE";
    DISPOSED: "DISPOSED";
    MAINTENANCE: "MAINTENANCE";
    RETIRED: "RETIRED";
    TESTING: "TESTING";
}>;
export declare const assetConditionEnum: z.ZodEnum<{
    DAMAGED: "DAMAGED";
    EXCELLENT: "EXCELLENT";
    FAIR: "FAIR";
    GOOD: "GOOD";
    NEEDS_REPAIR: "NEEDS_REPAIR";
    RETIRED: "RETIRED";
}>;
export declare const WORKFLOW_CONTROLLED_STATUSES: readonly ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'TESTING'];
export declare const createAssetSchema: z.ZodObject<{
    assetCode: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    name: z.ZodString;
    category: z.ZodEnum<{
        DESKTOP: "DESKTOP";
        LAPTOP: "LAPTOP";
        MONITOR: "MONITOR";
        OTHER: "OTHER";
        PRINTER: "PRINTER";
        PROJECTOR: "PROJECTOR";
        ROUTER: "ROUTER";
        SCANNER: "SCANNER";
        SERVER: "SERVER";
        SWITCH: "SWITCH";
        UPS: "UPS";
    }>;
    brand: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    model: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    serialNumber: z.ZodString;
    condition: z.ZodDefault<z.ZodEnum<{
        DAMAGED: "DAMAGED";
        EXCELLENT: "EXCELLENT";
        FAIR: "FAIR";
        GOOD: "GOOD";
        NEEDS_REPAIR: "NEEDS_REPAIR";
        RETIRED: "RETIRED";
    }>>;
    departmentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    location: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    purchaseDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    purchasePrice: z.ZodNullable<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    warrantyExpiry: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const updateAssetSchema: z.ZodObject<{
    assetCode: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
    name: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<{
        DESKTOP: "DESKTOP";
        LAPTOP: "LAPTOP";
        MONITOR: "MONITOR";
        OTHER: "OTHER";
        PRINTER: "PRINTER";
        PROJECTOR: "PROJECTOR";
        ROUTER: "ROUTER";
        SCANNER: "SCANNER";
        SERVER: "SERVER";
        SWITCH: "SWITCH";
        UPS: "UPS";
    }>>;
    brand: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    model: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    serialNumber: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        DISPOSED: "DISPOSED";
        RETIRED: "RETIRED";
    }>>;
    condition: z.ZodOptional<z.ZodEnum<{
        DAMAGED: "DAMAGED";
        EXCELLENT: "EXCELLENT";
        FAIR: "FAIR";
        GOOD: "GOOD";
        NEEDS_REPAIR: "NEEDS_REPAIR";
        RETIRED: "RETIRED";
    }>>;
    departmentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    location: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    purchaseDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    purchasePrice: z.ZodNullable<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    warrantyExpiry: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const updateAssetStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        DISPOSED: "DISPOSED";
        RETIRED: "RETIRED";
    }>;
}, z.core.$strip>;
export declare const assetQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    condition: z.ZodOptional<z.ZodString>;
    departmentId: z.ZodOptional<z.ZodString>;
    personal: z.ZodOptional<z.ZodUnion<[z.ZodEnum<{
        false: "false";
        true: "true";
    }>, z.ZodBoolean]>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strip>;
export type CreateAssetDTO = z.infer<typeof createAssetSchema>;
export type UpdateAssetDTO = z.infer<typeof updateAssetSchema>;
export type AssetQueryDTO = z.infer<typeof assetQuerySchema>;
//# sourceMappingURL=asset.validator.d.ts.map