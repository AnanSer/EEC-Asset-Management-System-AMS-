import { Resend } from 'resend';
export declare const resend: Resend | null;
export declare const DEFAULT_EMAIL_FROM: string;
export interface SendEmailPayload {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
}
/**
 * Send an email using Resend with graceful fallback in local/development mode.
 */
export declare function sendEmail({ to, subject, html, text }: SendEmailPayload): Promise<{
    success: boolean;
    id?: string;
}>;
//# sourceMappingURL=resend.d.ts.map