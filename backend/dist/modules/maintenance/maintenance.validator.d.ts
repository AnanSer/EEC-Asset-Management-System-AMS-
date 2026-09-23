import { z } from 'zod';
export declare const issueCategoryEnum: z.ZodEnum<{
    HARDWARE: "HARDWARE";
    NETWORK: "NETWORK";
    OTHER: "OTHER";
    POWER_UPS: "POWER_UPS";
    PRINTER: "PRINTER";
    SOFTWARE: "SOFTWARE";
}>;
export declare const maintenancePriorityEnum: z.ZodEnum<{
    CRITICAL: "CRITICAL";
    HIGH: "HIGH";
    LOW: "LOW";
    MEDIUM: "MEDIUM";
}>;
export declare const maintenanceStatusEnum: z.ZodEnum<{
    CANCELLED: "CANCELLED";
    COMPLETED: "COMPLETED";
    IN_PROGRESS: "IN_PROGRESS";
    ON_HOLD: "ON_HOLD";
    OPEN: "OPEN";
    TESTING: "TESTING";
}>;
export declare const createMaintenanceSchema: z.ZodObject<{
    assetId: z.ZodString;
    category: z.ZodEnum<{
        HARDWARE: "HARDWARE";
        NETWORK: "NETWORK";
        OTHER: "OTHER";
        POWER_UPS: "POWER_UPS";
        PRINTER: "PRINTER";
        SOFTWARE: "SOFTWARE";
    }>;
    priority: z.ZodDefault<z.ZodEnum<{
        CRITICAL: "CRITICAL";
        HIGH: "HIGH";
        LOW: "LOW";
        MEDIUM: "MEDIUM";
    }>>;
    description: z.ZodString;
    reportedBy: z.ZodString;
    assignedTechnician: z.ZodString;
    cost: z.ZodNullable<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        CANCELLED: "CANCELLED";
        COMPLETED: "COMPLETED";
        IN_PROGRESS: "IN_PROGRESS";
        ON_HOLD: "ON_HOLD";
        OPEN: "OPEN";
        TESTING: "TESTING";
    }>>>;
    resolutionNotes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const updateMaintenanceSchema: z.ZodObject<{
    assetId: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<{
        HARDWARE: "HARDWARE";
        NETWORK: "NETWORK";
        OTHER: "OTHER";
        POWER_UPS: "POWER_UPS";
        PRINTER: "PRINTER";
        SOFTWARE: "SOFTWARE";
    }>>;
    priority: z.ZodOptional<z.ZodEnum<{
        CRITICAL: "CRITICAL";
        HIGH: "HIGH";
        LOW: "LOW";
        MEDIUM: "MEDIUM";
    }>>;
    description: z.ZodOptional<z.ZodString>;
    reportedBy: z.ZodOptional<z.ZodString>;
    assignedTechnician: z.ZodOptional<z.ZodString>;
    cost: z.ZodNullable<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    startDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    completedDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<{
        CANCELLED: "CANCELLED";
        COMPLETED: "COMPLETED";
        IN_PROGRESS: "IN_PROGRESS";
        ON_HOLD: "ON_HOLD";
        OPEN: "OPEN";
        TESTING: "TESTING";
    }>>;
    resolutionNotes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const updateMaintenanceStatusSchema: z.ZodObject<{
    status: z.ZodEnum<{
        CANCELLED: "CANCELLED";
        COMPLETED: "COMPLETED";
        IN_PROGRESS: "IN_PROGRESS";
        ON_HOLD: "ON_HOLD";
        OPEN: "OPEN";
        TESTING: "TESTING";
    }>;
    resolutionNotes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const maintenanceQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    technician: z.ZodOptional<z.ZodString>;
    assetId: z.ZodOptional<z.ZodString>;
    personal: z.ZodOptional<z.ZodUnion<[z.ZodEnum<{
        false: "false";
        true: "true";
    }>, z.ZodBoolean]>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strip>;
export type IssueCategoryDTO = z.infer<typeof issueCategoryEnum>;
export type MaintenancePriorityDTO = z.infer<typeof maintenancePriorityEnum>;
export type MaintenanceStatusDTO = z.infer<typeof maintenanceStatusEnum>;
export type CreateMaintenanceDTO = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceDTO = z.infer<typeof updateMaintenanceSchema>;
export type UpdateMaintenanceStatusDTO = z.infer<typeof updateMaintenanceStatusSchema>;
export type MaintenanceQueryDTO = z.infer<typeof maintenanceQuerySchema>;
//# sourceMappingURL=maintenance.validator.d.ts.map