"use strict";
// EEC EAMS – Nodemailer Gmail SMTP Transporter (Phase 9D.8)
// Replaces Resend with Nodemailer using Gmail SMTP for enterprise email delivery.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = exports.DEFAULT_EMAIL_FROM = void 0;
exports.verifyEmailTransporter = verifyEmailTransporter;
exports.sendEmail = sendEmail;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const nodemailer_1 = __importDefault(require("nodemailer"));
const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.SMTP_PORT || '587', 10);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const isSecure = port === 465;
exports.DEFAULT_EMAIL_FROM = process.env.EMAIL_FROM ||
    (user ? `Ethiopian Engineering Corporation <${user}>` : 'Ethiopian Engineering Corporation <no-reply@eec.gov.et>');
exports.transporter = nodemailer_1.default.createTransport({
    host,
    port,
    secure: isSecure,
    auth: user && pass ? { user, pass } : undefined,
    tls: {
        rejectUnauthorized: false,
    },
});
/**
 * Verifies transporter connectivity on server startup.
 * Logs success or failure.
 */
async function verifyEmailTransporter() {
    if (!user || !pass) {
        console.log('⚠️ [SMTP Verification] SMTP_USER or SMTP_PASS not set in environment. Outbound emails will simulate in console.');
        return false;
    }
    try {
        await exports.transporter.verify();
        console.log(`✅ [SMTP Verification] Gmail SMTP connected successfully (${host}:${port}) as ${user}`);
        return true;
    }
    catch (error) {
        console.error(`❌ [SMTP Verification] Gmail SMTP connection failed (${host}:${port}):`, error?.message || error);
        return false;
    }
}
/**
 * Send an email via Nodemailer Gmail SMTP with simulated console fallback if unconfigured.
 */
async function sendEmail({ to, subject, html, text, }) {
    const recipients = Array.isArray(to) ? to.join(', ') : to;
    const from = process.env.EMAIL_FROM || (user ? `Ethiopian Engineering Corporation <${user}>` : exports.DEFAULT_EMAIL_FROM);
    if (!user || !pass) {
        console.log('\n======================================================');
        console.log('📧 [EMAIL DISPATCH - DEV SIMULATION]');
        console.log(`To:       ${recipients}`);
        console.log(`From:     ${from}`);
        console.log(`Subject:  ${subject}`);
        if (text) {
            console.log(`Content:\n${text}`);
        }
        console.log('======================================================\n');
        return { success: true, id: `mock-${Date.now()}` };
    }
    try {
        const info = await exports.transporter.sendMail({
            from,
            to: recipients,
            subject,
            text: text || '',
            html,
        });
        console.log(`📧 [SMTP Dispatch Success] Message sent to ${recipients}: MessageId=${info.messageId}`);
        return { success: true, id: info.messageId };
    }
    catch (error) {
        console.error(`❌ [SMTP Dispatch Error] Failed to send email to ${recipients}:`, error?.message || error);
        return { success: false, error: error?.message || 'SMTP delivery failure' };
    }
}
//# sourceMappingURL=transporter.js.map