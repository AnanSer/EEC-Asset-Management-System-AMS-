export * from './transporter';
export * from './templates';
export interface SendVerificationEmailInput {
    to: string;
    name?: string | null;
    verificationUrl: string;
    token: string;
}
export interface SendPasswordResetEmailInput {
    to: string;
    name?: string | null;
    resetUrl: string;
    token: string;
}
export interface SendWelcomeApprovedEmailInput {
    to: string;
    name?: string | null;
    employeeId?: string;
    departmentName?: string;
    role?: string;
    loginUrl: string;
}
export interface SendWelcomeInvitationEmailInput {
    to: string;
    name?: string | null;
    employeeId?: string;
    departmentName?: string;
    role?: string;
    resetUrl: string;
    token?: string;
}
/**
 * Dispatch an official EEC corporate email verification message.
 */
export declare function sendVerificationEmail({ to, name, verificationUrl, token, }: SendVerificationEmailInput): Promise<{
    success: boolean;
    id?: string;
    error?: string;
}>;
/**
 * Dispatch an official EEC password recovery message.
 */
export declare function sendPasswordResetEmail({ to, name, resetUrl, token, }: SendPasswordResetEmailInput): Promise<{
    success: boolean;
    id?: string;
    error?: string;
}>;
/**
 * Dispatch Welcome Email when an ADMIN approves a pending self-registered employee.
 */
export declare function sendWelcomeApprovedEmail({ to, name, employeeId, departmentName, role, loginUrl, }: SendWelcomeApprovedEmailInput): Promise<{
    success: boolean;
    id?: string;
    error?: string;
}>;
/**
 * Dispatch Welcome Email when an ADMIN manually creates an employee, including password creation link.
 */
export declare function sendWelcomeInvitationEmail({ to, name, employeeId, departmentName, role, resetUrl, }: SendWelcomeInvitationEmailInput): Promise<{
    success: boolean;
    id?: string;
    error?: string;
}>;
//# sourceMappingURL=index.d.ts.map