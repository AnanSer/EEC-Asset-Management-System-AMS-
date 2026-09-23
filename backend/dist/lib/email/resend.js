"use strict";
// EEC EAMS – Email Service Client (Phase 9C)
// Resend integration for authentication notifications and transactional emails.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_EMAIL_FROM = exports.resend = void 0;
exports.sendEmail = sendEmail;
const resend_1 = require("resend");
const resendApiKey = process.env.RESEND_API_KEY;
exports.resend = resendApiKey ? new resend_1.Resend(resendApiKey) : null;
exports.DEFAULT_EMAIL_FROM = process.env.EMAIL_FROM || 'EEC EAMS Security <onboarding@resend.dev>';
/**
 * Send an email using Resend with graceful fallback in local/development mode.
 */
async function sendEmail({ to, subject, html, text }) {
    const recipients = Array.isArray(to) ? to : [to];
    if (!exports.resend) {
        console.log('\n======================================================');
        console.log('📧 [EMAIL DISPATCH - DEV SIMULATION]');
        console.log(`To:       ${recipients.join(', ')}`);
        console.log(`From:     ${exports.DEFAULT_EMAIL_FROM}`);
        console.log(`Subject:  ${subject}`);
        if (text) {
            console.log(`Content:\n${text}`);
        }
        console.log('======================================================\n');
        return { success: true, id: `mock-${Date.now()}` };
    }
    try {
        const response = await exports.resend.emails.send({
            from: exports.DEFAULT_EMAIL_FROM,
            to: recipients,
            subject,
            html,
            text: text || '',
        });
        if (response.error) {
            console.error('[Resend Error]', response.error);
            return { success: false };
        }
        return { success: true, id: response.data?.id };
    }
    catch (error) {
        console.error('[Resend Exception]', error);
        return { success: false };
    }
}
//# sourceMappingURL=resend.js.map