import { z } from 'zod';
export declare const assignAssetSchema: z.ZodObject<{
    assetId: z.ZodString;
    employeeId: z.ZodString;
    assignedDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    conditionOnAssign: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    remarks: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const transferAssetSchema: z.ZodObject<{
    newEmployeeId: z.ZodString;
    transferDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    conditionOnTransfer: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    remarks: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const returnAssetSchema: z.ZodObject<{
    returnDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    conditionOnReturn: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    remarks: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const assignmentQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    departmentId: z.ZodOptional<z.ZodString>;
    employeeId: z.ZodOptional<z.ZodString>;
    assetId: z.ZodOptional<z.ZodString>;
    isCurrent: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        all: "all";
        false: "false";
        true: "true";
    }>>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strip>;
export type AssignAssetDTO = z.infer<typeof assignAssetSchema>;
export type TransferAssetDTO = z.infer<typeof transferAssetSchema>;
export type ReturnAssetDTO = z.infer<typeof returnAssetSchema>;
export type AssignmentQueryDTO = z.infer<typeof assignmentQuerySchema>;
//# sourceMappingURL=assignment.validator.d.ts.map