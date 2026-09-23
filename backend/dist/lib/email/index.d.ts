export * from './resend';
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
/**
 * Dispatch an official EEC corporate email verification message.
 */
export declare function sendVerificationEmail({ to, name, verificationUrl, token, }: SendVerificationEmailInput): Promise<{
    success: boolean;
    id?: string;
}>;
/**
 * Dispatch an official EEC password recovery message.
 */
export declare function sendPasswordResetEmail({ to, name, resetUrl, token, }: SendPasswordResetEmailInput): Promise<{
    success: boolean;
    id?: string;
}>;
//# sourceMappingURL=index.d.ts.map