// EEC EAMS – Transactional Email Templates (Phase 9C)
// High-fidelity responsive HTML and text templates with official EEC branding.

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
export function renderEmailVerificationTemplate({
  name,
  verificationUrl,
  token,
}: VerificationEmailParams): { subject: string; html: string; text: string } {
  const recipientName = name?.trim() || 'EEC Employee';
  const subject = 'Verify Your Corporate Email — EEC EAMS';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 40px 16px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #083D4A 0%, #06313B 100%);
      padding: 32px 28px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .header p {
      margin: 6px 0 0;
      font-size: 13px;
      color: #93c5fd;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
    }
    .content {
      padding: 36px 32px;
      background-color: #ffffff;
    }
    .greeting {
      font-size: 17px;
      font-weight: 600;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .paragraph {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .cta-box {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background-color: #083D4A;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      padding: 14px 32px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(8, 61, 74, 0.25);
    }
    .security-callout {
      background-color: #f8fafc;
      border-left: 4px solid #00A7D6;
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 28px;
      font-size: 13px;
      color: #334155;
      line-height: 1.5;
    }
    .security-callout strong {
      color: #083D4A;
    }
    .raw-link {
      font-size: 12px;
      color: #64748b;
      word-break: break-all;
      background: #f8fafc;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      margin-top: 16px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
    }
    .footer p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Ethiopian Engineering Corporation</h1>
        <p>Enterprise Asset Management System</p>
      </div>
      <div class="content">
        <h2 class="greeting">Hello, ${recipientName}</h2>
        <p class="paragraph">
          Thank you for requesting access to the EEC Enterprise Asset Management System. To safeguard organizational resources, please confirm that you own this corporate email address.
        </p>

        <div class="cta-box">
          <a href="${verificationUrl}" class="btn" target="_blank" rel="noopener noreferrer">
            Verify Corporate Email
          </a>
        </div>

        <div class="security-callout">
          <strong>Security Notice:</strong> This verification link will expire in <strong>60 minutes</strong>. If you did not request this account or believe this is an error, please ignore this email or contact the ICT Security Desk.
        </div>

        <p class="paragraph" style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
          If the button above does not work, copy and paste this link into your browser:
        </p>
        <div class="raw-link">
          ${verificationUrl}
        </div>
      </div>
      <div class="footer">
        <p><strong>Ethiopian Engineering Corporation (EEC)</strong></p>
        <p>ICT Directorate &amp; Enterprise Systems Group &bull; Addis Ababa, Ethiopia</p>
        <p style="margin-top: 8px; font-size: 11px; color: #94a3b8;">This is an automated system message. Please do not reply directly to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Ethiopian Engineering Corporation (EEC)
Enterprise Asset Management System (EAMS)

Hello, ${recipientName},

Please verify your corporate email address for your EEC EAMS account.

Verification Link:
${verificationUrl}

Security Notice:
This link is valid for 60 minutes. Once used, it will immediately become invalid.
If you did not register for an account, please disregard this email.

---
EEC ICT Directorate & Enterprise Systems Group
Addis Ababa, Ethiopia
  `.trim();

  return { subject, html, text };
}

/**
 * Generate Password Reset HTML & plain text.
 */
export function renderPasswordResetTemplate({
  name,
  resetUrl,
  token,
}: PasswordResetEmailParams): { subject: string; html: string; text: string } {
  const recipientName = name?.trim() || 'EEC Employee';
  const subject = 'Password Reset Request — EEC EAMS';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 40px 16px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #083D4A 0%, #06313B 100%);
      padding: 32px 28px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .header p {
      margin: 6px 0 0;
      font-size: 13px;
      color: #93c5fd;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 600;
    }
    .content {
      padding: 36px 32px;
      background-color: #ffffff;
    }
    .greeting {
      font-size: 17px;
      font-weight: 600;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .paragraph {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .cta-box {
      text-align: center;
      margin: 32px 0;
    }
    .btn {
      display: inline-block;
      background-color: #C96F59;
      color: #ffffff !important;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      padding: 14px 32px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(201, 111, 89, 0.3);
    }
    .security-callout {
      background-color: #fff1f2;
      border-left: 4px solid #f43f5e;
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 28px;
      font-size: 13px;
      color: #881337;
      line-height: 1.5;
    }
    .security-callout strong {
      color: #9f1239;
    }
    .raw-link {
      font-size: 12px;
      color: #64748b;
      word-break: break-all;
      background: #f8fafc;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      margin-top: 16px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
    }
    .footer p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Ethiopian Engineering Corporation</h1>
        <p>Enterprise Asset Management System</p>
      </div>
      <div class="content">
        <h2 class="greeting">Hello, ${recipientName}</h2>
        <p class="paragraph">
          We received a request to reset the password associated with your EEC EAMS account. Click the button below to choose a new, secure password.
        </p>

        <div class="cta-box">
          <a href="${resetUrl}" class="btn" target="_blank" rel="noopener noreferrer">
            Reset Account Password
          </a>
        </div>

        <div class="security-callout">
          <strong>Security Notice:</strong> This password recovery link will expire in <strong>30 minutes</strong>. If you did not initiate this request, your account remains secure — please notify the ICT Security Desk immediately.
        </div>

        <p class="paragraph" style="font-size: 12px; color: #64748b; margin-bottom: 6px;">
          If the button above does not work, copy and paste this link into your browser:
        </p>
        <div class="raw-link">
          ${resetUrl}
        </div>
      </div>
      <div class="footer">
        <p><strong>Ethiopian Engineering Corporation (EEC)</strong></p>
        <p>ICT Directorate &amp; Enterprise Systems Group &bull; Addis Ababa, Ethiopia</p>
        <p style="margin-top: 8px; font-size: 11px; color: #94a3b8;">This is an automated system message. Please do not reply directly to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Ethiopian Engineering Corporation (EEC)
Enterprise Asset Management System (EAMS)

Hello, ${recipientName},

We received a request to reset your password for the EEC EAMS system.

Password Reset Link:
${resetUrl}

Security Notice:
This link is valid for 30 minutes only.
If you did not request a password reset, please ignore this email or contact ICT Administration.

---
EEC ICT Directorate & Enterprise Systems Group
Addis Ababa, Ethiopia
  `.trim();

  return { subject, html, text };
}
