import { z } from 'zod';
export declare const updateSettingsSchema: z.ZodObject<{
    organizationName: z.ZodOptional<z.ZodString>;
    organizationShortName: z.ZodOptional<z.ZodString>;
    supportEmail: z.ZodOptional<z.ZodString>;
    supportPhone: z.ZodOptional<z.ZodString>;
    headquartersAddress: z.ZodOptional<z.ZodString>;
    logoUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    defaultLanguage: z.ZodOptional<z.ZodEnum<{
        AM: "AM";
        EN: "EN";
        OM: "OM";
    }>>;
    timezone: z.ZodOptional<z.ZodString>;
    dateFormat: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type UpdateSettingsDTO = z.infer<typeof updateSettingsSchema>;
//# sourceMappingURL=settings.validator.d.ts.map