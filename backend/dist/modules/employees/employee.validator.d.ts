import { z } from 'zod';
export declare const userRoleEnum: z.ZodEnum<{
    ADMIN: "ADMIN";
    EMPLOYEE: "EMPLOYEE";
    MANAGER: "MANAGER";
    SUPER_ADMIN: "SUPER_ADMIN";
    VIEWER: "VIEWER";
}>;
export declare const createEmployeeSchema: z.ZodObject<{
    fullName: z.ZodString;
    employeeId: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    email: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    position: z.ZodString;
    departmentId: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<{
        ADMIN: "ADMIN";
        EMPLOYEE: "EMPLOYEE";
        MANAGER: "MANAGER";
        SUPER_ADMIN: "SUPER_ADMIN";
        VIEWER: "VIEWER";
    }>>;
    officeLocation: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const updateEmployeeSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    employeeId: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
    email: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    position: z.ZodOptional<z.ZodString>;
    departmentId: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<{
        ADMIN: "ADMIN";
        EMPLOYEE: "EMPLOYEE";
        MANAGER: "MANAGER";
        SUPER_ADMIN: "SUPER_ADMIN";
        VIEWER: "VIEWER";
    }>>;
    officeLocation: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const updateEmployeeStatusSchema: z.ZodObject<{
    isActive: z.ZodBoolean;
}, z.core.$strip>;
export declare const employeeQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    departmentId: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        active: "active";
        all: "all";
        inactive: "inactive";
    }>>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strip>;
export type CreateEmployeeDTO = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeDTO = z.infer<typeof updateEmployeeSchema>;
export type EmployeeQueryDTO = z.infer<typeof employeeQuerySchema>;
//# sourceMappingURL=employee.validator.d.ts.map