import { z } from 'zod';
export declare const inspectionResultEnum: z.ZodEnum<{
    FAIL: "FAIL";
    PASS: "PASS";
}>;
export declare const createInspectionSchema: z.ZodObject<{
    ticketId: z.ZodString;
    testedBy: z.ZodString;
    testDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    result: z.ZodEnum<{
        FAIL: "FAIL";
        PASS: "PASS";
    }>;
    testType: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    findings: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    recommendations: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    autoComplete: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateInspectionSchema: z.ZodObject<{
    testedBy: z.ZodOptional<z.ZodString>;
    testDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    result: z.ZodOptional<z.ZodEnum<{
        FAIL: "FAIL";
        PASS: "PASS";
    }>>;
    testType: z.ZodOptional<z.ZodString>;
    findings: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    recommendations: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type CreateInspectionDTO = z.infer<typeof createInspectionSchema>;
export type UpdateInspectionDTO = z.infer<typeof updateInspectionSchema>;
//# sourceMappingURL=testing.validator.d.ts.map