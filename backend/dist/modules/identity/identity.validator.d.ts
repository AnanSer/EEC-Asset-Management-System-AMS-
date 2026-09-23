import { z } from 'zod';
export declare const userRoleEnum: z.ZodEnum<{
    ADMIN: "ADMIN";
    DEPARTMENT_MANAGER: "DEPARTMENT_MANAGER";
    EMPLOYEE: "EMPLOYEE";
    IT_TECHNICIAN: "IT_TECHNICIAN";
}>;
export declare const accountStatusEnum: z.ZodEnum<{
    APPROVED: "APPROVED";
    PENDING: "PENDING";
    REJECTED: "REJECTED";
    SUSPENDED: "SUSPENDED";
}>;
/**
 * Registration Request Schema
 * Used when a new employee or user submits a registration request.
 */
export declare const registrationSchema: z.ZodObject<{
    email: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    password: z.ZodString;
    fullName: z.ZodString;
    employeeId: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    departmentId: z.ZodString;
    position: z.ZodString;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    officeLocation: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    requestedRole: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        ADMIN: "ADMIN";
        DEPARTMENT_MANAGER: "DEPARTMENT_MANAGER";
        EMPLOYEE: "EMPLOYEE";
        IT_TECHNICIAN: "IT_TECHNICIAN";
    }>>>;
}, z.core.$strip>;
/**
 * Approval Request Schema
 * Used when an administrator approves a pending account request.
 */
export declare const approvalSchema: z.ZodObject<{
    role: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        ADMIN: "ADMIN";
        DEPARTMENT_MANAGER: "DEPARTMENT_MANAGER";
        EMPLOYEE: "EMPLOYEE";
        IT_TECHNICIAN: "IT_TECHNICIAN";
    }>>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
/**
 * Rejection Request Schema
 * Used when an administrator rejects a pending account request.
 */
export declare const rejectionSchema: z.ZodObject<{
    reason: z.ZodString;
}, z.core.$strip>;
/**
 * Account Suspension Schema (for future use)
 */
export declare const suspensionSchema: z.ZodObject<{
    isSuspended: z.ZodBoolean;
    reason: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
/**
 * Query schema for listing pending account requests
 */
export declare const pendingUserQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    departmentId: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strip>;
export type RegistrationRequest = z.infer<typeof registrationSchema>;
export type RegistrationRequestDTO = RegistrationRequest;
export type ApprovalRequest = z.infer<typeof approvalSchema>;
export type ApprovalRequestDTO = ApprovalRequest;
export type RejectionRequest = z.infer<typeof rejectionSchema>;
export type RejectionRequestDTO = RejectionRequest;
export type SuspensionRequest = z.infer<typeof suspensionSchema>;
export type SuspensionRequestDTO = SuspensionRequest;
export type PendingUserQueryDTO = z.infer<typeof pendingUserQuerySchema>;
/**
 * DTO for Pending User Response item
 */
export interface PendingUserResponse {
    id: string;
    email: string;
    role: z.infer<typeof userRoleEnum>;
    status: z.infer<typeof accountStatusEnum>;
    isEmailVerified: boolean;
    createdAt: Date;
    employeeProfile?: {
        id: string;
        employeeId: string;
        firstName: string;
        lastName: string;
        fullName: string;
        phone: string | null;
        jobTitle: string;
        departmentId: string;
        departmentName?: string;
        officeLocation: string | null;
    } | null;
}
//# sourceMappingURL=identity.validator.d.ts.map