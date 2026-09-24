interface VerificationEmailParams {
    name?: string | null;
    verificationUrl: string;
    token: string;
}
interface PasswordResetEmailParams {
    name?: string | null;
    resetUrl: string;
    token: string;
}
/**
 * Generate Email Verification HTML & plain text.
 */
export declare function renderEmailVerificationTemplate({ name, verificationUrl, token, }: VerificationEmailParams): {
    subject: string;
    html: string;
    text: string;
};
/**
 * Generate Password Reset HTML & plain text.
 */
export declare function renderPasswordResetTemplate({ name, resetUrl, token, }: PasswordResetEmailParams): {
    subject: string;
    html: string;
    text: string;
};
export interface WelcomeApprovedEmailParams {
    name?: string | null;
    employeeId?: string;
    departmentName?: string;
    role?: string;
    loginUrl: string;
}
/**
 * Generate Welcome Email HTML & plain text for admin-approved self-registered employees.
 * Does not ask them to create another password.
 */
export declare function renderWelcomeApprovedTemplate({ name, employeeId, departmentName, role, loginUrl, }: WelcomeApprovedEmailParams): {
    subject: string;
    html: string;
    text: string;
};
export interface WelcomeInvitationEmailParams {
    name?: string | null;
    employeeId?: string;
    departmentName?: string;
    role?: string;
    resetUrl: string;
}
/**
 * Generate Welcome Email HTML & plain text for admin-created employees.
 * Includes a "Create Your Password" button linking to /reset-password?token=...
 */
export declare function renderWelcomeInvitationTemplate({ name, employeeId, departmentName, role, resetUrl, }: WelcomeInvitationEmailParams): {
    subject: string;
    html: string;
    text: string;
};
export {};
//# sourceMappingURL=templates.d.ts.map