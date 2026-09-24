// EEC EAMS – Email Service Entrypoint (Phase 9C)
// High-level transactional email methods for Better Auth lifecycle and user notifications.

import { sendEmail } from './resend';
import {
  renderEmailVerificationTemplate,
  renderPasswordResetTemplate,
  renderWelcomeApprovedTemplate,
  renderWelcomeInvitationTemplate,
} from './templates';

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
export async function sendVerificationEmail({
  to,
  name,
  verificationUrl,
  token,
}: SendVerificationEmailInput) {
  const { subject, html, text } = renderEmailVerificationTemplate({
    name,
    verificationUrl,
    token,
  });

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Dispatch an official EEC password recovery message.
 */
export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
  token,
}: SendPasswordResetEmailInput) {
  const { subject, html, text } = renderPasswordResetTemplate({
    name,
    resetUrl,
    token,
  });

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Dispatch Welcome Email when an ADMIN approves a pending self-registered employee.
 */
export async function sendWelcomeApprovedEmail({
  to,
  name,
  employeeId,
  departmentName,
  role,
  loginUrl,
}: SendWelcomeApprovedEmailInput) {
  const { subject, html, text } = renderWelcomeApprovedTemplate({
    name,
    employeeId,
    departmentName,
    role,
    loginUrl,
  });

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Dispatch Welcome Email when an ADMIN manually creates an employee, including password creation link.
 */
export async function sendWelcomeInvitationEmail({
  to,
  name,
  employeeId,
  departmentName,
  role,
  resetUrl,
}: SendWelcomeInvitationEmailInput) {
  const { subject, html, text } = renderWelcomeInvitationTemplate({
    name,
    employeeId,
    departmentName,
    role,
    resetUrl,
  });

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

