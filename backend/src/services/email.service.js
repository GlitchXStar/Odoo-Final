const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 5,
});

// Warm the connection pool at startup — logs errors early, doesn't throw
transporter.verify()
  .then(() => console.log('✓ SMTP connection verified'))
  .catch((err) => console.warn('⚠ SMTP connection failed:', err.message));

const sendOTPEmail = async (toEmail, otpCode, firstName) => {
  const safeName = escapeHtml(firstName || 'User');
  const mailOptions = {
    from: `"EmPay HRMS" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'EmPay - Your Login OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #2563eb;">EmPay HRMS</h2>
        <p>Hello ${safeName},</p>
        <p>Your one-time password for login is:</p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${otpCode}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">If you did not request this code, please ignore this email.</p>
      </div>
    `,
    text: `EmPay HRMS - Your OTP is: ${otpCode}. Valid for 5 minutes.`,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

const escapeHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const sendCredentialsEmail = async (toEmail, { firstName, loginId, temporaryPassword, companyName }) => {
  const safeName    = escapeHtml(firstName);
  const safeCompany = escapeHtml(companyName || 'your company');

  const mailOptions = {
    from: `"EmPay HRMS" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Welcome to ${safeCompany} — Your EmPay Account`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #2563eb; margin: 0;">EmPay HRMS</h2>
          <p style="color: #64748b; margin: 4px 0 0;">${safeCompany}</p>
        </div>
        <p style="font-size: 16px;">Hi <strong>${safeName}</strong>,</p>
        <p>Welcome aboard! Your account on <strong>${safeCompany}</strong>'s EmPay HRMS portal has been created. Here are your login credentials:</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Login ID</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${escapeHtml(loginId)}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${escapeHtml(toEmail)}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Temporary Password</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a; font-family: monospace;">${escapeHtml(temporaryPassword)}</td></tr>
          </table>
        </div>
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
          <p style="margin: 0; color: #dc2626; font-size: 14px;"><strong>Action required:</strong> You must change your password on first login.</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">This is an automated message from EmPay HRMS. Please do not reply to this email.</p>
      </div>
    `,
    text: `Welcome to ${companyName || 'EmPay HRMS'}!\n\nHi ${firstName},\n\nYour account has been created.\n\nLogin ID: ${loginId}\nEmail: ${toEmail}\nTemporary Password: ${temporaryPassword}\n\nYou must change your password on first login.`,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

const sendWelcomeAdminEmail = async (toEmail, { firstName, lastName, loginId, companyName, companyCode }) => {
  const safeName    = escapeHtml(`${firstName} ${lastName}`);
  const safeCompany = escapeHtml(companyName);
  const safeCode    = escapeHtml(companyCode);
  const safeLoginId = escapeHtml(loginId);
  const safeEmail   = escapeHtml(toEmail);

  const mailOptions = {
    from: `"EmPay HRMS" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Welcome to EmPay HRMS — ${safeCompany} is all set!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h2 style="color: #2563eb; margin: 0;">EmPay HRMS</h2>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Human Resource Management System</p>
        </div>

        <p style="font-size: 16px;">Hi <strong>${safeName}</strong>,</p>
        <p style="color: #374151;">
          🎉 Your company has been successfully registered on <strong>EmPay HRMS</strong>.
          You are now the <strong>Admin</strong> of your organisation's HR portal.
          Here's a summary of your setup:
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 12px; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Company Details</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #64748b; width: 150px;">Company Name</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${safeCompany}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Company Code</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${safeCode}</td></tr>
          </table>
        </div>

        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 12px; font-size: 13px; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.05em;">Your Admin Credentials</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 6px 0; color: #64748b; width: 150px;">Name</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${safeName}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Email</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${safeEmail}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b;">Login ID</td><td style="padding: 6px 0; font-weight: bold; color: #0f172a; font-family: monospace;">${safeLoginId}</td></tr>
          </table>
        </div>

        <p style="color: #374151;">You can log in using either your <strong>Email</strong> or <strong>Login ID</strong> along with the password you set during registration.</p>

        <div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px;">
          <p style="margin: 0; color: #15803d; font-size: 14px;"><strong>Next steps:</strong> Set up your shifts, leave types, and add your employees from the HR portal.</p>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">This is an automated message from EmPay HRMS. Please do not reply.</p>
      </div>
    `,
    text: `Welcome to EmPay HRMS!\n\nHi ${firstName} ${lastName},\n\nYour company "${companyName}" (Code: ${companyCode}) has been registered.\n\nYour Admin credentials:\n  Email: ${toEmail}\n  Login ID: ${loginId}\n\nLog in with your email or Login ID and the password you set during registration.\n\nNext steps: Set up shifts, leave types, and add employees.`,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = { sendOTPEmail, sendCredentialsEmail, sendWelcomeAdminEmail };
