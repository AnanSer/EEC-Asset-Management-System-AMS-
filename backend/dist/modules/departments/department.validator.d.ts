import { z } from 'zod';
export declare const createDepartmentSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    location: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    officeLocation: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    building: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    floor: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    headOfDepartment: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateDepartmentSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    code: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    location: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    officeLocation: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    building: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    floor: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    headOfDepartment: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodOptional<z.ZodBoolean>>>;
}, z.core.$strip>;
export declare const updateStatusSchema: z.ZodObject<{
    isActive: z.ZodBoolean;
}, z.core.$strip>;
export declare const departmentQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        active: "active";
        all: "all";
        inactive: "inactive";
    }>>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strip>;
export type CreateDepartmentDTO = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentDTO = z.infer<typeof updateDepartmentSchema>;
export type DepartmentQueryDTO = z.infer<typeof departmentQuerySchema>;
//# sourceMappingURL=department.validator.d.ts.map