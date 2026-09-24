// EEC EAMS – Nodemailer Gmail SMTP Transporter (Phase 9D.8)
// Replaces Resend with Nodemailer using Gmail SMTP for enterprise email delivery.

import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.SMTP_PORT || '587', 10);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const isSecure = port === 465;

export const DEFAULT_EMAIL_FROM =
  process.env.EMAIL_FROM ||
  (user ? `Ethiopian Engineering Corporation <${user}>` : 'Ethiopian Engineering Corporation <no-reply@eec.gov.et>');

export const transporter: Transporter = nodemailer.createTransport({
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
export async function verifyEmailTransporter(): Promise<boolean> {
  if (!user || !pass) {
    console.log('⚠️ [SMTP Verification] SMTP_USER or SMTP_PASS not set in environment. Outbound emails will simulate in console.');
    return false;
  }

  try {
    await transporter.verify();
    console.log(`✅ [SMTP Verification] Gmail SMTP connected successfully (${host}:${port}) as ${user}`);
    return true;
  } catch (error: any) {
    console.error(`❌ [SMTP Verification] Gmail SMTP connection failed (${host}:${port}):`, error?.message || error);
    return false;
  }
}

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email via Nodemailer Gmail SMTP with simulated console fallback if unconfigured.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  const recipients = Array.isArray(to) ? to.join(', ') : to;
  const from = process.env.EMAIL_FROM || (user ? `Ethiopian Engineering Corporation <${user}>` : DEFAULT_EMAIL_FROM);

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
    const info = await transporter.sendMail({
      from,
      to: recipients,
      subject,
      text: text || '',
      html,
    });

    console.log(`📧 [SMTP Dispatch Success] Message sent to ${recipients}: MessageId=${info.messageId}`);
    return { success: true, id: info.messageId };
  } catch (error: any) {
    console.error(`❌ [SMTP Dispatch Error] Failed to send email to ${recipients}:`, error?.message || error);
    return { success: false, error: error?.message || 'SMTP delivery failure' };
  }
}
