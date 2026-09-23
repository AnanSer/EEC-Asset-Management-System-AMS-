// EEC EAMS – Email Service Client (Phase 9C)
// Resend integration for authentication notifications and transactional emails.

import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const DEFAULT_EMAIL_FROM =
  process.env.EMAIL_FROM || 'EEC EAMS Security <onboarding@resend.dev>';

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Resend with graceful fallback in local/development mode.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailPayload): Promise<{ success: boolean; id?: string }> {
  const recipients = Array.isArray(to) ? to : [to];

  if (!resend) {
    console.log('\n======================================================');
    console.log('📧 [EMAIL DISPATCH - DEV SIMULATION]');
    console.log(`To:       ${recipients.join(', ')}`);
    console.log(`From:     ${DEFAULT_EMAIL_FROM}`);
    console.log(`Subject:  ${subject}`);
    if (text) {
      console.log(`Content:\n${text}`);
    }
    console.log('======================================================\n');
    return { success: true, id: `mock-${Date.now()}` };
  }

  try {
    const response = await resend.emails.send({
      from: DEFAULT_EMAIL_FROM,
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
  } catch (error) {
    console.error('[Resend Exception]', error);
    return { success: false };
  }
}
