"use strict";
// EEC EAMS – Email Service Entrypoint (Phase 9C)
// High-level transactional email methods for Better Auth lifecycle and user notifications.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = sendVerificationEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
exports.sendWelcomeApprovedEmail = sendWelcomeApprovedEmail;
exports.sendWelcomeInvitationEmail = sendWelcomeInvitationEmail;
const resend_1 = require("./resend");
const templates_1 = require("./templates");
__exportStar(require("./resend"), exports);
__exportStar(require("./templates"), exports);
/**
 * Dispatch an official EEC corporate email verification message.
 */
async function sendVerificationEmail({ to, name, verificationUrl, token, }) {
    const { subject, html, text } = (0, templates_1.renderEmailVerificationTemplate)({
        name,
        verificationUrl,
        token,
    });
    return (0, resend_1.sendEmail)({
        to,
        subject,
        html,
        text,
    });
}
/**
 * Dispatch an official EEC password recovery message.
 */
async function sendPasswordResetEmail({ to, name, resetUrl, token, }) {
    const { subject, html, text } = (0, templates_1.renderPasswordResetTemplate)({
        name,
        resetUrl,
        token,
    });
    return (0, resend_1.sendEmail)({
        to,
        subject,
        html,
        text,
    });
}
/**
 * Dispatch Welcome Email when an ADMIN approves a pending self-registered employee.
 */
async function sendWelcomeApprovedEmail({ to, name, employeeId, departmentName, role, loginUrl, }) {
    const { subject, html, text } = (0, templates_1.renderWelcomeApprovedTemplate)({
        name,
        employeeId,
        departmentName,
        role,
        loginUrl,
    });
    return (0, resend_1.sendEmail)({
        to,
        subject,
        html,
        text,
    });
}
/**
 * Dispatch Welcome Email when an ADMIN manually creates an employee, including password creation link.
 */
async function sendWelcomeInvitationEmail({ to, name, employeeId, departmentName, role, resetUrl, }) {
    const { subject, html, text } = (0, templates_1.renderWelcomeInvitationTemplate)({
        name,
        employeeId,
        departmentName,
        role,
        resetUrl,
    });
    return (0, resend_1.sendEmail)({
        to,
        subject,
        html,
        text,
    });
}
//# sourceMappingURL=index.js.map