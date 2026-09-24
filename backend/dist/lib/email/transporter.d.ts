import type { Transporter } from 'nodemailer';
export declare const DEFAULT_EMAIL_FROM: string;
export declare const transporter: Transporter;
/**
 * Verifies transporter connectivity on server startup.
 * Logs success or failure.
 */
export declare function verifyEmailTransporter(): Promise<boolean>;
export interface SendEmailPayload {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
}
/**
 * Send an email via Nodemailer Gmail SMTP with simulated console fallback if unconfigured.
 */
export declare function sendEmail({ to, subject, html, text, }: SendEmailPayload): Promise<{
    success: boolean;
    id?: string;
    error?: string;
}>;
//# sourceMappingURL=transporter.d.ts.map