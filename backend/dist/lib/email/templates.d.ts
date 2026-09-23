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
export {};
//# sourceMappingURL=templates.d.ts.map